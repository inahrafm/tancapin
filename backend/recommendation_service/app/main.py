# recommendation_service/app/main.py

import os
from datetime import datetime, timedelta # <--- Perlu ini untuk timedelta jika belum ada
from typing import Dict, Any, List, Optional # <--- Pastikan Optional juga ada
from fastapi import FastAPI, Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import JWTError, jwt
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Tancap - Layanan Rekomendasi",
    description="API untuk memberikan rekomendasi pemupukan, penyiraman, dll. berdasarkan data sensor dan prediksi."
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
ACCESS_TOKEN_EXPIRE_MINUTES = 10080 # 1 minggu

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
    except JWTError as e: # Tangkap exception JWTError secara spesifik
        print(f"JWT Validation Error: {e}") # Log error validasi JWT
        raise credentials_exception
    except Exception as e: # Tangkap exception lainnya
        print(f"Unexpected error during token validation: {e}")
        raise credentials_exception
    return username
# ------------------------------------------

# 1. Mendefinisikan struktur data input untuk rekomendasi
class RecommendationInput(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float
    estimated_yield_kg: float
    yield_category: str
    pest_risk_level: str

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan Rekomendasi Tancap!"}

@app.post("/get_recommendations")
async def get_recommendations(
    data: RecommendationInput,
    current_user: str = Security(get_current_user)
) -> Dict[str, Any]:
    print(f"User '{current_user}' meminta rekomendasi.")
    recommendations: List[str] = []
    issues: List[str] = []

    # LOGIKA REKOMENDASI DUMMY
    if data.nitrogen < 10:
        recommendations.append("Lakukan pemupukan tambahan dengan pupuk kaya Nitrogen (mis. Urea) untuk pertumbuhan daun.")
        issues.append("Kadar Nitrogen rendah.")
    elif data.phosphorus < 5:
        recommendations.append("Pertimbangkan pupuk kaya Fosfor untuk akar dan bunga (mis. SP-36).")
        issues.append("Kadar Fosfor rendah.")
    elif data.potassium < 15:
        recommendations.append("Berikan pupuk kaya Kalium untuk kualitas buah dan ketahanan penyakit (mis. KCl).")
        issues.append("Kadar Kalium rendah.")
    
    if data.ph < 6.0:
        recommendations.append("Tingkatkan pH tanah dengan penambahan kapur pertanian.")
        issues.append("pH tanah terlalu asam.")
    elif data.ph > 7.5:
        recommendations.append("Turunkan pH tanah dengan bahan organik atau belerang.")
        issues.append("pH tanah terlalu basa.")

    if data.humidity < 60 and data.temperature > 28:
        recommendations.append("Lakukan penyiraman intensif, terutama di pagi atau sore hari.")
        issues.append("Kelembaban rendah dan suhu tinggi.")
    elif data.humidity < 70 and data.temperature < 20:
        recommendations.append("Pantau kelembaban tanah, penyiraman moderat mungkin diperlukan.")

    if data.pest_risk_level == "Tinggi":
        recommendations.append("Segera lakukan pemeriksaan lapangan untuk hama dan siapkan penanganan. Gunakan pestisida nabati jika memungkinkan.")
        issues.append("Risiko hama tinggi.")
    elif data.pest_risk_level == "Sedang":
        recommendations.append("Tingkatkan pemantauan rutin untuk tanda-tanda hama.")
    
    if data.yield_category == "Rendah":
        recommendations.append("Evaluasi kembali praktik budidaya. Perhatikan nutrisi dan kondisi lingkungan.")

    if not recommendations:
        recommendations.append("Kondisi lahan saat ini cukup baik. Lanjutkan pemantauan rutin!")

    return {
        "status": "sukses",
        "message": "Rekomendasi berhasil dibuat",
        "input_data": data.dict(),
        "recommendations": recommendations,
        "issues_detected": issues
    }