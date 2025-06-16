# backend/user_service/app/main.py
import os
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import Depends, FastAPI, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware # <--- PASTIKAN BARIS INI ADA

from . import models
from .database import SessionLocal, engine, get_db

# Membuat tabel di database jika belum ada
models.Base.metadata.create_all(bind=engine)

# Konfigurasi
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080 # Token berlaku 1 minggu (7 hari * 24 jam * 60 menit)

# Konteks untuk hashing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI(title="Tancap - Layanan User")

# --- KONFIGURASI CORS ---
# Ini mengizinkan frontend (yang berjalan di localhost:8080) untuk berkomunikasi dengan backend ini
origins = [
    "http://localhost",
    "http://localhost:8080", # <--- PASTIKAN ORIGIN INI ADA
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Mengizinkan semua metode HTTP (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"], # Mengizinkan semua header
)
# ------------------------

# --- KONFIGURASI JWT UNTUK KEAMANAN API ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8002/token")

# Tambahkan pengecekan untuk SECRET_KEY saat startup
if SECRET_KEY is None:
    raise ValueError("JWT_SECRET_KEY not set in environment variables. Please check your .env file.")

# Fungsi untuk mendapatkan user saat ini dari token JWT
async def get_current_user(token: str = Security(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError as e:
        print(f"JWT Validation Error: {e}")
        raise credentials_exception
    except Exception as e:
        print(f"Unexpected error during token validation: {e}")
        raise credentials_exception
    return username
# ------------------------------------------

# --- Pydantic Schemas (Model Data) ---
# Menggunakan UserCreateSchema yang diimpor dari models.py
UserCreate = models.UserCreateSchema 

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Fungsi-fungsi Bantuan ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Endpoint API ---
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Cek apakah username atau email sudah terdaftar
    db_user_by_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar")
    
    db_user_by_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    hashed_password = get_password_hash(user.password)
    # Membuat user baru dengan username, email, dan hashed_password
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_password) 
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "sukses", "message": f"User {user.username} dengan email {user.email} berhasil dibuat."}

@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Username atau password salah",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Endpoint untuk mendapatkan semua user (dilindungi JWT)
@app.get("/users", response_model=List[models.UserBase])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: str = Security(get_current_user)
):
    """
    Mengambil daftar semua pengguna yang terdaftar di sistem. Membutuhkan autentikasi JWT.
    """
    print(f"User '{current_user}' meminta daftar semua pengguna.")
    users = db.query(models.User).all()
    return users