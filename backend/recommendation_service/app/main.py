# recommendation_service/app/main.py

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any, List

app = FastAPI(
    title="Tancap - Layanan Rekomendasi",
    description="API untuk memberikan rekomendasi pemupukan, penyiraman, dll. berdasarkan data sensor dan prediksi."
)

# 1. Mendefinisikan struktur data input untuk rekomendasi
# Ini akan menggabungkan data sensor dan hasil prediksi
class RecommendationInput(BaseModel):
    # Data Sensor (dari IoT Service)
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    temperature: float
    humidity: float

    # Data Prediksi (dari Prediction Service)
    estimated_yield_kg: float
    yield_category: str
    pest_risk_level: str # 'Rendah', 'Sedang', 'Tinggi'

@app.get("/")
def root():
    return {"message": "Selamat datang di API Layanan Rekomendasi Tancap!"}

# 2. Endpoint untuk mendapatkan rekomendasi
@app.post("/get_recommendations")
def get_recommendations(data: RecommendationInput) -> Dict[str, Any]:
    """
    Memberikan rekomendasi berdasarkan data sensor dan hasil prediksi.
    """
    recommendations: List[str] = []
    issues: List[str] = []

    # --- LOGIKA REKOMENDASI DUMMY ---
    # Rekomendasi Pemupukan
    if data.nitrogen < 10:
        recommendations.append("Lakukan pemupukan tambahan dengan pupuk kaya Nitrogen (mis. Urea) untuk pertumbuhan daun.")
        issues.append("Kadar Nitrogen rendah.")
    elif data.phosphorus < 5:
        recommendations.append("Pertimbangkan pupuk kaya Fosfor untuk akar dan bunga (mis. SP-36).")
        issues.append("Kadar Fosfor rendah.")
    elif data.potassium < 15:
        recommendations.append("Berikan pupuk kaya Kalium untuk kualitas buah dan ketahanan penyakit (mis. KCl).")
        issues.append("Kadar Kalium rendah.")
    
    # Rekomendasi pH
    if data.ph < 6.0:
        recommendations.append("Tingkatkan pH tanah dengan penambahan kapur pertanian.")
        issues.append("pH tanah terlalu asam.")
    elif data.ph > 7.5:
        recommendations.append("Turunkan pH tanah dengan bahan organik atau belerang.")
        issues.append("pH tanah terlalu basa.")

    # Rekomendasi Penyiraman
    if data.humidity < 60 and data.temperature > 28:
        recommendations.append("Lakukan penyiraman intensif, terutama di pagi atau sore hari.")
        issues.append("Kelembaban rendah dan suhu tinggi.")
    elif data.humidity < 70 and data.temperature < 20:
        recommendations.append("Pantau kelembaban tanah, penyiraman moderat mungkin diperlukan.")

    # Rekomendasi terkait Hama
    if data.pest_risk_level == "Tinggi":
        recommendations.append("Segera lakukan pemeriksaan lapangan untuk hama dan siapkan penanganan. Gunakan pestisida nabati jika memungkinkan.")
        issues.append("Risiko hama tinggi.")
    elif data.pest_risk_level == "Sedang":
        recommendations.append("Tingkatkan pemantauan rutin untuk tanda-tanda hama.")
    
    # Rekomendasi terkait Panen
    if data.yield_category == "Rendah":
        recommendations.append("Evaluasi kembali praktik budidaya. Perhatikan nutrisi dan kondisi lingkungan.")

    if not recommendations:
        recommendations.append("Kondisi lahan saat ini cukup baik. Lanjutkan pemantauan rutin!")
    # -----------------------------------------------------------------------

    print(f"Data input untuk rekomendasi: {data.dict()}")
    print(f"Rekomendasi yang dihasilkan: {recommendations}")
    print(f"Masalah terdeteksi: {issues if issues else 'Tidak ada'}")


    return {
        "status": "sukses",
        "message": "Rekomendasi berhasil dibuat",
        "input_data": data.dict(),
        "recommendations": recommendations,
        "issues_detected": issues
    }