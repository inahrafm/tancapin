# iot_service/app/main.py

from fastapi import FastAPI, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from . import models
from .database import SessionLocal, engine
import datetime
from typing import List # <--- TAMBAHKAN IMPORT INI

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tancap - Layanan IoT",
    description="API untuk menerima dan mengelola data sensor dari lahan pertanian di Lembang."
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schema untuk data yang masuk (Create)
class SensorData(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float

# --- KODE BARU 1: Schema untuk data yang keluar (Read) ---
# Kita buat schema baru untuk respons agar ID dan timestamp juga ikut ditampilkan
class SensorReadingResponse(SensorData):
    id: int
    timestamp: datetime.datetime

    class Config:
        orm_mode = True # Ini mengizinkan Pydantic membaca data dari objek ORM

# --------------------------------------------------------

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan IoT Tancap!"}

@app.post("/data/sensor")
def terima_data_sensor(data: SensorData, db: Session = Depends(get_db)):
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

# --- KODE BARU 2: Endpoint untuk MEMBACA semua data ---
@app.get("/data/sensor/all", response_model=List[SensorReadingResponse])
def baca_semua_data_sensor(db: Session = Depends(get_db)):
    """
    Mengambil seluruh riwayat data sensor dari database.
    """
    all_readings = db.query(models.SensorReading).all()
    print("Mengambil semua data sensor dari database...")
    return all_readings
# ----------------------------------------------------