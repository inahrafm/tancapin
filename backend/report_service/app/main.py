# report_service/app/main.py

import os
from fastapi import FastAPI, Depends, Query, HTTPException, status, Security
from fastapi.responses import FileResponse
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models
from .database import SessionLocal, engine, get_db # <--- PASTIKAN get_db DIIMPORT DARI .database
import datetime
import pandas as pd
from typing import List, Optional
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tancap - Layanan Laporan",
    description="API untuk menghasilkan dan mengunduh laporan data pertanian."
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
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- KONFIGURASI JWT UNTUK KEAMANAN API ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8002/token")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"

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

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan Laporan Tancap!"}

# --- PROTEKSI ENDPOINT DENGAN JWT ---
@app.get("/reports/sensor_data_excel")
async def generate_sensor_data_excel_report(
    db: Session = Depends(get_db), # <-- get_db sekarang diimport
    current_user: str = Security(get_current_user)
):
    """
    Menghasilkan dan menyediakan laporan data sensor dalam format Excel. Membutuhkan autentikasi JWT.
    """
    print(f"User '{current_user}' meminta laporan data sensor Excel.")
    all_readings = db.query(models.SensorReading).all()

    if not all_readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tidak ada data sensor yang ditemukan untuk dibuat laporan."
        )

    data_dicts = []
    for reading in all_readings:
        data_dicts.append({
            "ID": reading.id,
            "Timestamp": reading.timestamp.isoformat() if reading.timestamp else None,
            "Nitrogen": reading.nitrogen,
            "Phosphorus": reading.phosphorus,
            "Potassium": reading.potassium,
            "pH": reading.ph,
            "Temperature": reading.temperature,
            "Humidity": reading.humidity
        })
    
    df = pd.DataFrame(data_dicts)

    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"laporan_data_sensor_{timestamp_str}.xlsx"
    file_path = f"/tmp/{file_name}"

    try:
        df.to_excel(file_path, index=False, engine='openpyxl')
    except Exception as e:
        print(f"Gagal membuat file Excel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat membuat file laporan Excel: {str(e)}"
        )

    print(f"Laporan Excel berhasil dibuat di {file_path}")

    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=file_name
    )