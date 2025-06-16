# prediction_service/app/main.py

import os # <--- TAMBAHKAN IMPORT INI untuk mengakses environment variables
from fastapi import FastAPI, Depends, HTTPException, status, Security # <--- Tambahkan HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer # <--- TAMBAHKAN IMPORT INI
from pydantic import BaseModel
from typing import Dict, Any # <--- Tambahkan Dict, Any
from jose import JWTError, jwt # <--- TAMBAHKAN IMPORT INI
from fastapi.middleware.cors import CORSMiddleware # <--- Pastikan ini diimpor untuk CORS

app = FastAPI(
    title="Tancap - Layanan Prediksi",
    description="API untuk melakukan prediksi hasil panen dan risiko hama berdasarkan data sensor."
)

# KONFIGURASI CORS
# Ini mengizinkan frontend (yang berjalan di localhost:8080) untuk berkomunikasi dengan backend ini
origins = [
    "http://localhost",
    "http://localhost:8080", # Origin dari frontend React Anda
    # Tambahkan origin lain jika diperlukan
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

# 1. Mendefinisikan struktur data input untuk prediksi
# Ini mirip dengan SensorData, tapi mungkin saja nanti ada data tambahan
class PredictionInput(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float
    # Bisa ditambahkan: rainfall: float, soil_type: str, dll.

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan Prediksi Tancap!"}

# --- PROTEKSI ENDPOINT DENGAN JWT ---
@app.post("/predict/harvest")
async def predict_harvest(
    data: PredictionInput,
    current_user: str = Security(get_current_user) # Proteksi endpoint ini
) -> Dict[str, Any]:
    """
    Melakukan estimasi hasil panen berdasarkan data kondisi tanah. Membutuhkan autentikasi JWT.
    Untuk saat ini, ini adalah prediksi dummy.
    """
    print(f"User '{current_user}' meminta prediksi panen.")
    # --- LOGIKA PREDIKSI DUMMY (nantinya diganti dengan model ML sungguhan) ---
    # Contoh sederhana: semakin tinggi NPK, semakin tinggi potensi hasil
    potential = (data.nitrogen + data.phosphorus + data.potassium) / 3
    estimated_yield_kg = round(potential * 5 + data.temperature * 2, 2) # Contoh perhitungan dummy
    if estimated_yield_kg < 100:
        category = "Rendah"
    elif estimated_yield_kg < 250:
        category = "Sedang"
    else:
        category = "Tinggi"
    # -----------------------------------------------------------------------

    return {
        "status": "sukses",
        "message": "Estimasi hasil panen berhasil dilakukan",
        "input_data": data.dict(),
        "prediction": {
            "estimated_yield_kg": estimated_yield_kg,
            "yield_category": category
        }
    }

# --- PROTEKSI ENDPOINT DENGAN JWT ---
@app.post("/predict/pest_risk")
async def predict_pest_risk(
    data: PredictionInput,
    current_user: str = Security(get_current_user) # Proteksi endpoint ini
) -> Dict[str, Any]:
    """
    Melakukan prediksi risiko serangan hama berdasarkan data kondisi tanah. Membutuhkan autentikasi JWT.
    Untuk saat ini, ini adalah prediksi dummy.
    """
    print(f"User '{current_user}' meminta prediksi risiko hama.")
    # --- LOGIKA PREDIKSI DUMMY RISIKO HAMA ---
    # Contoh sederhana: suhu dan kelembaban tinggi meningkatkan risiko hama
    risk_score = (data.temperature * 0.3) + (data.humidity * 0.2) + (data.ph * 0.1) # Contoh perhitungan dummy
    
    risk_level = "Rendah"
    if risk_score > 35:
        risk_level = "Tinggi"
    elif risk_score > 25:
        risk_level = "Sedang"
    
    # ----------------------------------------

    return {
        "status": "sukses",
        "message": "Prediksi risiko hama berhasil dilakukan",
        "input_data": data.dict(),
        "prediction": {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2)
        }
    }