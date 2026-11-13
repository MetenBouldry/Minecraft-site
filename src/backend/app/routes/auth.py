from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import uuid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user:UserCreate, db: Session = Depends(get_db)):
    # 1. Перевірка довжини пароля
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Пароль має містити мінімум 8 символів")

    # 2. Перевірка на існуючого користувача
    db_user = db.execute(
        select(User).where((User.username == user.username) | (User.email == user.email))
    ).scalar_one_or_none()

    if db_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.username == form_data.username)).scalar_one_or_none()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    # ВАЖЛИВО: тепер використовуємо str(user.id)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()

    # Генерація токен
    if user:
        token = str(uuid.uuid4())
        user.reset_token = token
        db.commit()

        # Виводимо в логи (для тестів)
        print(f"======================================")
        print(f"🔑 ТОКЕН ДЛЯ ВІДНОВЛЕННЯ: {token}")
        print(f"======================================")
    return {"message": "Якщо email існує, інструкції будуть надіслані."}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    # 1. Перевірка довжини нового пароля
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Пароль занадто короткий (мін. 8 символів)")
    
    user = db.execute(select(User).where(User.reset_token == data.token)).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Недійсний або застарілий токен")

    # Зміна паролю
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None # Очистка токена після використання
    db.commit()

    return {"message": "Пароль успішно змінено!"}