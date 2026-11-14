import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import select
from dotenv import load_dotenv

from .database import get_db
from .models import User
from pwdlib import PasswordHash

# Завантажуємо .env для локальної розробки
load_dotenv()

# ═══════ БЕЗПЕКА ═══════
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY :
    raise ValueError("❌ SECRET_KEY не встановлений!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 #Доба

# PasswordHash.recommended() автоматично обирає Argon2 як основний алгоритм
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
    return password_hash.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ═══════ ОТРИМАННЯ КОРИСТУВАЧА (SQLAlchemy 2.0) ═══════
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail="Invalid credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None: raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # СУЧАСНИЙ СТАНДАРТ: select() замість query()
    user = db.execute(select(User).where(User.id == int(user_id))).scalar_one_or_none()
    if user is None: raise credentials_exception
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
        if current_user.role not in["admin", "owner"]:
            raise HTTPException(status_code=403, detail="Not enough permission")
        return current_user

def get_current_owner(current_user: User = Depends(get_current_user)):
    # Тільки Власник
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owner can do this")