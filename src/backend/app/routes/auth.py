from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, Token, UserResponse, PasswordResetRequest, PasswordResetConfirm
from ..auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
import uuid

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(user:UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.username == user.username) | (User.email == user.email)).first()
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
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/forgot-password")
def forgot_password(data: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # З міркувань безпеки не кажемо, чи є такий email
        return {"message": "Якщо email існує, інструкції будуть надіслані."}

    # Генерація токен
    token = str(uuid.uuid4())
    user.reset_token = token
    db.commit()

    # У РЕАЛЬНОМУ ЖИТТІ ТУТ БУДЕ ВІДПРАВКА EMAIL
    # А поки що ми виводимо токен у логи сервера
    print(f"======================================")
    print(f"🔑 ТОКЕН ДЛЯ ВІДНОВЛЕННЯ: {token}")
    print(f"======================================")

    return {"message": "Інструкції надіслані (перевірте логи сервера)"}

@router.post("/reset-password")
def reset_password(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Недійсний або застарілий токен")

    # Зміна паролю
    user.hashed_password = get_password_hash(data.new_password)
    user.reset_token = None # Очистка токена після використання
    db.commit()

    return {"message": "Пароль успішно змінено!"}