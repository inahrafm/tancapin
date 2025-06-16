# iot_service/app/main.py

import os # <--- TAMBAHKAN IMPORT INI untuk mengakses environment variables
from fastapi import FastAPI, Depends, Query, HTTPException, status, Security # <--- Tambahkan HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer # <--- TAMBAHKAN IMPORT INI
from pydantic import BaseModel
from sqlalchemy.orm import Session
from . import models
from .database import SessionLocal, engine
import datetime
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt # <--- TAMBAHKAN IMPORT INI

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tancap - Layanan IoT",
    description="API untuk menerima dan mengelola data sensor dari lahan pertanian di Lembang."
)

# KONFIGURASI CORS
origins = [
    "http://localhost",
    "http://localhost:8080", # Origin dari frontend React Anda
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Mengizinkan semua metode HTTP (GET, POST, PUT, DELETE, OPTIONS)
    allow_headers=["*"], # Mengizinkan semua header
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- KONFIGURASI JWT UNTUK KEAMANAN API ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8002/token") # Mengarah ke endpoint token user-service

SECRET_KEY = os.getenv("JWT_SECRET_KEY") # Ambil dari environment variable .env
ALGORITHM = "HS256" # Algoritma yang sama dengan user-service

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
    except JWTError:
        raise credentials_exception
    # Di sini Anda bisa mengambil user dari database jika perlu,
    # tapi untuk validasi token saja, cukup kembalikan username
    return username
# ------------------------------------------

# Schema untuk data yang masuk (Create)
class SensorData(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float

# Schema untuk data yang keluar (Read)
class SensorReadingResponse(SensorData):
    id: int
    timestamp: datetime.datetime

    class Config:
        from_attributes = True # Perbarui dari orm_mode menjadi from_attributes untuk Pydantic V2+

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan IoT Tancap!"}

# --- PROTEKSI ENDPOINT DENGAN JWT ---
@app.post("/data/sensor")
async def terima_data_sensor(
    data: SensorData, 
    db: Session = Depends(get_db),
    current_user: str = Security(get_current_user) # Proteksi endpoint ini
):
    """
    Menerima data sensor dari perangkat. Membutuhkan autentikasi JWT.
    """
    print(f"User '{current_user}' mengirim data sensor.")
    db_sensor_reading = models.SensorReading(**data.dict())
    db.add(db_sensor_reading)
    db.commit()
    db.refresh(db_sensor_reading)
    print(f"Data BERHASIL DISIMPAN ke database dengan ID: {db_sensor_reading.id}")
    return {
        "status": "sukses",
        "message": "Data sensor berhasil disimpan ke database",
        "saved_data": db_sensor_reading
    }

# --- PROTEKSI ENDPOINT DENGAN JWT ---
@app.get("/data/sensor/all", response_model=List[SensorReadingResponse])
async def baca_semua_data_sensor(
    start_timestamp: Optional[datetime.datetime] = Query(None, description="Filter data dari tanggal/waktu ini (ISO format, misal: 2025-06-01T00:00:00Z)"),
    end_timestamp: Optional[datetime.datetime] = Query(None, description="Filter data hingga tanggal/waktu ini (ISO format, misal: 2025-06-30T23:59:59Z)"),
    db: Session = Depends(get_db),
    current_user: str = Security(get_current_user) # Proteksi endpoint ini
):
    """
    Mengambil riwayat data sensor dari database, dengan opsi filter berdasarkan rentang waktu.
    Membutuhkan autentikasi JWT.
    """
    print(f"User '{current_user}' mengambil data sensor.")
    query = db.query(models.SensorReading)

    if start_timestamp:
        query = query.filter(models.SensorReading.timestamp >= start_timestamp)
    if end_timestamp:
        query = query.filter(models.SensorReading.timestamp <= end_timestamp)
    
    # Tambahkan pengurutan agar data selalu terurut berdasarkan waktu
    query = query.order_by(models.SensorReading.timestamp.asc())

    all_readings = query.all()
    print(f"Mengambil {len(all_readings)} data sensor dari database (filter: {start_timestamp} - {end_timestamp})...")
    return all_readings