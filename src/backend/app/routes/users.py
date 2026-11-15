from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import select
import uuid
import os
import shutil

from ..database import get_db
from ..models import User
from ..schemas import UserResponse, ProfileUpdate
from ..auth import get_current_user, get_current_admin, get_current_owner, verify_password, get_password_hash

router = APIRouter()

# ═══════ БЕЗПЕКА АВАТАРОК ═══════
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024

# 1. Отримати дані поточного користувача
@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

# 2. Оновити дані поточного користувача (Ім'я, Email, Пароль)
@router.patch("/me", response_model=UserResponse)
def update_user_me(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Зміна імені
    if payload.username and str(payload.username) != current_user.username:
        exist = db.execute(select(User).where(User.username == payload.username)).scalar_one_or_none() # type: ignore
        
        if exist:
            raise HTTPException(status_code=400, detail="Ім'я вже зайняте")
        current_user.username = payload.username

    # Зміна Email
    if payload.email and payload.email != current_user.email:
        exist = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
        
        if exist:
            raise HTTPException(status_code=400, detail="Email вже зайнято")
        current_user.email = str(payload.email)

    # Зміна пароля
    if payload.new_password:
        if not payload.current_password:
            raise HTTPException(status_code=400, detail="Вкажіть поточний пароль")
        if not verify_password(payload.current_password, str(current_user.hashed_password)):
            raise HTTPException(status_code=400, detail="Невірний поточний пароль")
        if len (payload.new_password) <8:
            raise HTTPException(status_code=400, detail="Пароль занадто короткий(мін. 8 символів)")
        current_user.hashed_password = get_password_hash(payload.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

# 3. Завантаження аватара
@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> User:
    # 1. Перевірка розширення
    file_ext = os.path.splitext(str(file.filename))[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Дозволені формати: JPG, PNG, WEBP")

    # 2. Перевірка розміру
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Файл занадто великий (макс. 2 МБ)")
    await file.seek(0)# Повертаємо курсор

    # 3. Збереження
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = f"uploads/{unique_filename}"
    # Створюємо теку uploads, якщо її немає
    os.makedirs("uploads", exist_ok=True)

    # Зберігаємо файл
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer) # type: ignore

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
def get_users(db: Session = Depends(get_db), _ = Depends(get_current_admin)) -> list[User]:
    # current_admin не використовується в тілі, але потрібен для перевірки прав
    return list(db.execute(select(User)).scalars().all())

# 5. Змінити роль користувача (для адмінки)
@router.patch("/users/{user_id}/role", response_model=UserResponse)
def  update_user_role(
    user_id: int, 
    role: str, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
    ) -> User:
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    if user.role == "owner":
        raise HTTPException(status_code=403,detail="Не можна змінити роль власника")

    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Ви не можете змінити власну роль")

    user.role = role
    db.commit()
    db.refresh(user)
    return user

# 6. Видалити користувача (Тільки Owner)
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_owner: User = Depends(get_current_owner)
) -> dict[str, str]:
    user = db.execute(select(User).where(User.id == user_id)).scalar_one_or_none()

    # 1. Спочатку перевіряємо, чи існує користувач
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Захист: власник не може видалити себе
    if current_owner.id == user.id:
        raise HTTPException(status_code=400, detail="Ви не можете видалити себе")

    # 3. Не можна видалити іншого власника
    if user.role == "owner":
        raise HTTPException(status_code=403, detail="Не можна видалити власника")

    # Видалення аватарки
    if user.avatar_url:
        old_path = user.avatar_url.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    db.delete(user)
    db.commit()
    return {"message": "Користувача успішно видалено"}