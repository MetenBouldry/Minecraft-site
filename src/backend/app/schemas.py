from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, Annotated

UsernameType = Annotated[str,Field(min_length=3, max_length=20, pattern="^[a-zA-Z0-9_]+$")]
PasswordType = Annotated[str, Field(min_length=8, max_length=128)]

class UserCreate(BaseModel):
    username: UsernameType
    email: EmailStr
    password: PasswordType

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class ProfileUpdate(BaseModel):
    username: Optional[UsernameType] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[PasswordType] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str