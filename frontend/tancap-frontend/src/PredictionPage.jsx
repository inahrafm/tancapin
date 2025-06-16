import React, { useState, useEffect } from 'react';

const PredictionPage = () => {
  // State untuk input form konteks prediksi (bukan raw sensor)
  const [contextInput, setContextInput] = useState({
    crop_type: 'Padi', // Default
    land_area_ha: 1.0, // Default 1 hektar
    planting_date: new Date().toISOString().split('T')[0], // Tanggal hari ini
  });

  // State untuk hasil prediksi
  const [harvestPrediction, setHarvestPrediction] = useState(null);
  const [pestPrediction, setPestPrediction] = useState(null);
  const [loading, setLoading] = useState(false); // Default to false, trigger on button click
  const [error, setError] = useState(null);
  const [latestSensorDataFetched, setLatestSensorDataFetched] = useState(null); // Untuk menampilkan data sensor yang digunakan

  const PREDICTION_SERVICE_URL = 'http://localhost:8003'; // URL dasar untuk Prediction Service Anda
  const IOT_SERVICE_URL = 'http://localhost:8001'; // URL dasar untuk IoT Service Anda

  // Handle perubahan input form
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setContextInput(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  // Fungsi untuk mengambil data sensor terbaru DAN kemudian mengirimkannya untuk prediksi
  const fetchSensorAndPredict = async () => {
    setLoading(true);
    setError(null);
    setHarvestPrediction(null);
    setPestPrediction(null);
    setLatestSensorDataFetched(null); // Clear previous sensor data used for prediction

    try {
      const token = localStorage.getItem('access_token'); // Ambil token dari localStorage
      if (!token) {
        throw new Error("Autentikasi diperlukan. Silakan login kembali.");
      }

      // --- Langkah 1: Ambil data sensor terbaru dari IoT Service ---
      const iotResponse = await fetch(`${IOT_SERVICE_URL}/data/sensor/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!iotResponse.ok) {
        const errorData = await iotResponse.json();
        throw new Error(`Gagal memuat data sensor terbaru: ${errorData.detail || iotResponse.statusText}`);
      }
      const sensorData = await iotResponse.json();
      
      if (!sensorData || sensorData.length === 0) {
        throw new Error("Tidak ada data sensor terbaru untuk membuat prediksi. Silakan kirim data sensor terlebih dahulu.");
      }

      // Ambil data sensor terbaru
      const latestSensorData = sensorData[sensorData.length - 1];
      setLatestSensorDataFetched(latestSensorData); // Simpan data sensor yang digunakan

      // Buat objek input prediksi dari data sensor terbaru (sesuai yang diharapkan backend)
      const predictionInputForBackend = {
        nitrogen: latestSensorData.nitrogen,
        phosphorus: latestSensorData.phosphorus,
        potassium: latestSensorData.potassium,
        ph: latestSensorData.ph,
        temperature: latestSensorData.temperature,
        humidity: latestSensorData.humidity,
      };

      // --- Langkah 2: Kirim data sensor terbaru ke Prediction Service ---

      // Permintaan Prediksi Hasil Panen
      const harvestResponse = await fetch(`${PREDICTION_SERVICE_URL}/predict/harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(predictionInputForBackend),
      });

      if (!harvestResponse.ok) {
        const errorData = await harvestResponse.json();
        throw new Error(`Gagal memuat prediksi panen: ${errorData.detail || harvestResponse.statusText}`);
      }
      const harvestData = await harvestResponse.json();
      setHarvestPrediction(harvestData.prediction);

      // Permintaan Prediksi Risiko Hama
      const pestResponse = await fetch(`${PREDICTION_SERVICE_URL}/predict/pest_risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(predictionInputForBackend),
      });

      if (!pestResponse.ok) {
        const errorData = await pestResponse.json();
        throw new Error(`Gagal memuat prediksi hama: ${errorData.detail || pestResponse.statusText}`);
      }
      const pestData = await pestResponse.json();
      setPestPrediction(pestData.prediction);

    } catch (e) {
      setError("Error: " + e.message);
      console.error("Error fetching predictions:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Prediksi Pertanian</h2>

      {/* Form Input Konteks Prediksi */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Informasi Tambahan untuk Prediksi</h3>
        {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
                {error}
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="mb-2">
            <label htmlFor="crop_type" className="block text-gray-700 text-sm font-semibold mb-2">
              Jenis Tanaman
            </label>
            <select
              id="crop_type"
              name="crop_type"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              value={contextInput.crop_type}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="Padi">Padi</option>
              <option value="Jagung">Jagung</option>
              <option value="Cabai">Cabai</option>
              <option value="Tomat">Tomat</option>
              <option value="Kentang">Kentang</option>
              {/* Tambahkan jenis tanaman lain jika perlu */}
            </select>
          </div>
          <div className="mb-2">
            <label htmlFor="land_area_ha" className="block text-gray-700 text-sm font-semibold mb-2">
              Luas Lahan (Ha)
            </label>
            <input
              type="number"
              step="0.1"
              id="land_area_ha"
              name="land_area_ha"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              value={contextInput.land_area_ha}
              onChange={handleInputChange}
              disabled={loading}
              min="0.1"
            />
          </div>
          <div className="mb-2 md:col-span-2"> {/* Take full width on medium screens */}
            <label htmlFor="planting_date" className="block text-gray-700 text-sm font-semibold mb-2">
              Tanggal Tanam
            </label>
            <input
              type="date"
              id="planting_date"
              name="planting_date"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              value={contextInput.planting_date}
              onChange={handleInputChange}
              disabled={loading}
            />
          </div>
        </div>
        
        {/* Tampilkan data sensor yang digunakan untuk prediksi */}
        {latestSensorDataFetched && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
            <p className="font-semibold mb-1">Data Sensor Terbaru Digunakan:</p>
            <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(latestSensorDataFetched).map(([key, value]) => {
                if (key === 'id' || key === 'timestamp') return null; // Abaikan id dan timestamp
                const label = key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1);
                return <li key={key}>{label}: {value}</li>;
              })}
            </ul>
            <p className="mt-2 text-xs text-gray-500">Timestamp: {new Date(latestSensorDataFetched.timestamp).toLocaleString()}</p>
          </div>
        )}

        <button
          onClick={fetchSensorAndPredict}
          className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:shadow-outline transition duration-300 mt-4"
          disabled={loading}
        >
          {loading ? 'Memuat Prediksi...' : 'Dapatkan Prediksi'}
        </button>
      </div>

      {/* Area Hasil Prediksi */}
      {harvestPrediction && pestPrediction ? (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hasil Prediksi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kartu Prediksi Hasil Panen */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm flex flex-col items-center border border-blue-200">
              <span className="text-5xl mb-3">🌾</span>
              <p className="text-lg font-semibold text-gray-700">Estimasi Hasil Panen</p>
              <p className="text-3xl font-bold text-blue-800">{harvestPrediction.estimated_yield_kg} kg</p>
              <p className={`text-md font-medium mt-1 ${harvestPrediction.yield_category === 'Rendah' ? 'text-red-600' : harvestPrediction.yield_category === 'Sedang' ? 'text-orange-600' : 'text-green-600'}`}>
                Kategori: {harvestPrediction.yield_category}
              </p>
            </div>

            {/* Kartu Prediksi Risiko Hama */}
            <div className="bg-red-50 p-6 rounded-lg shadow-sm flex flex-col items-center border border-red-200">
              <span className="text-5xl mb-3">🐛</span>
              <p className="text-lg font-semibold text-gray-700">Risiko Serangan Hama</p>
              <p className={`text-3xl font-bold ${pestPrediction.risk_level === 'Tinggi' ? 'text-red-800' : pestPrediction.risk_level === 'Sedang' ? 'text-orange-800' : 'text-green-800'}`}>
                {pestPrediction.risk_level}
              </p>
              <p className="text-md font-medium text-gray-700 mt-1">
                Skor: {pestPrediction.risk_score}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Ini akan ditampilkan jika tidak ada hasil prediksi setelah loading
        <div className="text-center text-gray-600 p-8">
            Klik "Dapatkan Prediksi" untuk melihat hasil.
        </div>
      )}
    </div>
  );
};

export default PredictionPage;