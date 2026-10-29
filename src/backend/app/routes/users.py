from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import uuid
import os
import shutil

from ..database import get_db
from ..models import User
from ..schemas import UserResponse, ProfileUpdate
from ..auth import get_current_user, get_current_admin, verify_password, get_password_hash

router = APIRouter()

# 1. Отримати дані поточного користувача
@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

# 2. Оновити дані поточного користувача (Ім'я, Email, Пароль)
@router.patch("/me", response_model=UserResponse)
def update_user_me(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Зміна імені
    if payload.username and payload.username != current_user.username:
        exist = db.query(User).filter(User.username == payload.username).first()
        if exist:
            raise HTTPException(status_code=400, detail="Ім'я вже зайняте")
        current_user.username = payload.username

    # Зміна Email
    if payload.email and payload.email != current_user.email:
        exist = db.query(User).filter(User.email == payload.email).first()
        if exist:
            raise HTTPException(status_code=400, detail="Email вже зайнято")
        current_user.email = payload.email

    # Зміна паролю
    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Вкажіть пароль")
        if not verify_password(payload.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Невірний пароль")
        if len (payload.new_password) <6:
            raise HTTPException(status_code=400, detail="Пароль занадто короткий(мін. 6 символів)")
        current_user.hashed_password = get_password_hash(payload.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

# 3. Завантаження аватара
@router.post("/me/avatar", response_model=UserResponse)
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Перевірка, чи це картинка
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Файл має бути зображенням")

    # Генерація унікального ім'я файлу
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{unique_filename}"

    # Створюємо папку uploads, якщо її немає
    os.makedirs("uploads", exist_ok=True)

    # Зберігаємо файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Видаляємо старий аватар, якщо він був
    if current_user.avatar_url:
        old_path = current_user.avatar_url.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    # Оновлюємо БД
    current_user.avatar_url = f"/uploads/{unique_filename}"
    db.commit()
    db.refresh(current_user)

    return current_user

# 4. Отримати всіх користувачів (для адмінки)
@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), _ = Depends(get_current_admin)):
    return db.query(User).all()

# 5. Змінити роль користувача (для адмінки)
@router.patch("/users/{user_id}/role", response_model=UserResponse)
def  update_user_role(user_id: int, role: str, db: Session = Depends(get_db), _ = Depends(get_current_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = role
    db.commit()
    db.refresh(user)
    return user