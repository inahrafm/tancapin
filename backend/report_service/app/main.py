# report_service/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from . import models
from .database import SessionLocal, engine
import pandas as pd
import os
import datetime

# Membuat tabel di database jika belum ada (walaupun sudah dibuat oleh iot_service, ini memastikan)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Tancap - Layanan Laporan",
    description="API untuk menghasilkan dan mengunduh laporan data pertanian."
)

# Dependency untuk database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan Laporan Tancap!"}

# Endpoint untuk mengunduh laporan data sensor dalam format Excel
@app.get("/reports/sensor_data_excel")
def generate_sensor_data_excel_report(db: Session = Depends(get_db)):
    """
    Menghasilkan dan menyediakan laporan data sensor dalam format Excel.
    """
    print("Membuat laporan data sensor Excel...")

    # 1. Ambil semua data sensor dari database
    all_readings = db.query(models.SensorReading).all()

    if not all_readings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tidak ada data sensor yang ditemukan untuk dibuat laporan."
        )

    # 2. Konversi data ke format Pandas DataFrame
    # Mengubah objek SQLAlchemy menjadi dictionary agar mudah diolah Pandas
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

    # 3. Buat nama file yang unik
    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_name = f"laporan_data_sensor_{timestamp_str}.xlsx"
    file_path = f"/tmp/{file_name}" # Lokasi sementara di dalam kontainer

    # 4. Simpan DataFrame ke file Excel
    try:
        df.to_excel(file_path, index=False, engine='openpyxl')
    except Exception as e:
        print(f"Gagal membuat file Excel: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat membuat file laporan Excel: {str(e)}"
        )

    print(f"Laporan Excel berhasil dibuat di {file_path}")

    # 5. Kirim file sebagai respons
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=file_name
    )