from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Integer, String, DateTime
from .database import Base
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    role: Mapped[str] = mapped_column(String, default='user')
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

     # Токен та час його життя
    reset_token: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    reset_token_expiry: Mapped[Optional[DateTime]] = mapped_column(DateTime, nullable=True)