from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta, datetime, timezone
import uuid
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=UserResponse)
def register(user:UserCreate, db: Session = Depends(get_db)):
    # 1. Перевірка на існуючого користувача
    db_user = db.execute(select(User).where((User.username == user.username) | (User.email == user.email))).scalar_one_or_none()
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
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == form_data.username)).scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # ВАЖЛИВО: тепер використовуємо str(user.id)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()

    # Генерація токен
    if user:
        user.reset_token = str(uuid.uuid4())
        user.reset_token_expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
        
        db.commit()
        # Виводимо в логи (для тестів)
        print(f"======================================")
        print(f"🔑 ТОКЕН ДЛЯ ВІДНОВЛЕННЯ: {user.reset_token}")
        print(f"======================================")

    return {"message": "Якщо email існує, інструкції будуть надіслані."}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.reset_token == data.token)).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Недійсний токен")

    # Перевірка терміну дії
    if user.reset_token_expiry and user.reset_token_expiry.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Термін дії токена витік")

    # Зміна паролю
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None # Очистка токена після використання
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Пароль успішно змінено!"}