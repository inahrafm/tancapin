# prediction_service/app/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI(
    title="Tancap - Layanan Prediksi",
    description="API untuk melakukan prediksi hasil panen dan risiko hama berdasarkan data sensor."
)

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

# 2. Endpoint untuk estimasi hasil panen
@app.post("/predict/harvest")
def predict_harvest(data: PredictionInput) -> Dict[str, Any]:
    """
    Melakukan estimasi hasil panen berdasarkan data kondisi tanah.
    Untuk saat ini, ini adalah prediksi dummy.
    """
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

    print(f"Data input untuk prediksi panen: {data.dict()}")
    print(f"Estimasi hasil panen: {estimated_yield_kg} kg ({category})")

    return {
        "status": "sukses",
        "message": "Estimasi hasil panen berhasil dilakukan",
        "input_data": data.dict(),
        "prediction": {
            "estimated_yield_kg": estimated_yield_kg,
            "yield_category": category
        }
    }

# 3. Endpoint untuk prediksi risiko hama
@app.post("/predict/pest_risk")
def predict_pest_risk(data: PredictionInput) -> Dict[str, Any]:
    """
    Melakukan prediksi risiko serangan hama berdasarkan data kondisi tanah.
    Untuk saat ini, ini adalah prediksi dummy.
    """
    # --- LOGIKA PREDIKSI DUMMY RISIKO HAMA ---
    # Contoh sederhana: suhu dan kelembaban tinggi meningkatkan risiko hama
    risk_score = (data.temperature * 0.3) + (data.humidity * 0.2) + (data.ph * 0.1) # Contoh perhitungan dummy
    
    risk_level = "Rendah"
    if risk_score > 35:
        risk_level = "Tinggi"
    elif risk_score > 25:
        risk_level = "Sedang"
    
    # ----------------------------------------

    print(f"Data input untuk prediksi risiko hama: {data.dict()}")
    print(f"Prediksi risiko hama: {risk_level} (Skor: {round(risk_score, 2)})")

    return {
        "status": "sukses",
        "message": "Prediksi risiko hama berhasil dilakukan",
        "input_data": data.dict(),
        "prediction": {
            "risk_level": risk_level,
            "risk_score": round(risk_score, 2)
        }
    }