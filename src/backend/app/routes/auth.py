from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta, datetime, timezone
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..main import limiter
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=UserResponse)
@limiter.limit("3/minutes")
def register(request: Request, user:UserCreate, db: Session = Depends(get_db)) -> User:
    # 1. Перевірка на чинного користувача
    db_user = db.execute(select(User).where((User.username == user.username) | (User.email == user.email))).scalar_one_or_none() # type: ignore
    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute") # <--- АНТИБРУТФОРС
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)) -> dict[str, str]:
    _ = request # Прибирає попередження "Parameter 'request' value is not used"
    user = db.execute(select(User).where(User.username == form_data.username)).scalar_one_or_none() # type: ignore

    if not user or not verify_password(form_data.password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # ВАЖЛИВО: тепер використовуємо str(user.id)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
@limiter.limit("3/minutes")
def forgot_password(request: Request, data: PasswordResetRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none() # type: ignore

    # Генерація токен
    if user:
        user.reset_token = str(uuid.uuid4())
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15) # noqa
        
        db.commit()
        # Виводимо в логи (для тестів)
        print(f"======================================")
        print(f"🔑 ТОКЕН ДЛЯ ВІДНОВЛЕННЯ: {user.reset_token}")
        print(f"======================================")

    return {"message": "Якщо email існує, інструкції будуть надіслані."}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)) -> dict[str, str]:
    user = db.execute(select(User).where(User.reset_token == data.token)).scalar_one_or_none()  # type: ignore

    if not user:
        raise HTTPException(status_code=400, detail="Недійсний токен")

    # Перевірка терміну дії
    if user.reset_token_expiry and user.reset_token_expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Термін дії токена витік")

    # Зміна пароля
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None # Очищення токена після використання
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Пароль успішно змінено!"}