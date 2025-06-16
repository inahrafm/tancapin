# backend/user_service/app/models.py

from sqlalchemy import Column, Integer, String
from .database import Base
from pydantic import BaseModel, EmailStr # <--- TAMBAHKAN EmailStr

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) # <--- NEW: Kolom Email
    hashed_password = Column(String)

# --- Pydantic Schema for User Display (tanpa hashed_password) ---
class UserBase(BaseModel):
    id: int
    username: str
    email: EmailStr # <--- NEW: Tambahkan email
    # role: Optional[str] = None # Jika ada kolom role di tabel user

    class Config:
        from_attributes = True # Dulu orm_mode = True

# --- Pydantic Schema for User Creation (untuk request body) ---
# Ini akan digunakan di main.py untuk register
class UserCreateSchema(BaseModel): # Mengganti nama untuk menghindari konflik dengan UserCreate di main.py
    username: str
    email: EmailStr # <--- NEW: Tambahkan email
    password: str
