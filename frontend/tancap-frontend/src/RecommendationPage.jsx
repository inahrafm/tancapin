import React, { useState } from 'react';

const RecommendationPage = () => {
  // State for recommendation results
  const [recommendations, setRecommendations] = useState(null);
  const [issuesDetected, setIssuesDetected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latestSensorDataFetched, setLatestSensorDataFetched] = useState(null); // Untuk menampilkan data sensor yang digunakan
  const [latestPredictionResultsFetched, setLatestPredictionResultsFetched] = useState(null); // Untuk menampilkan data prediksi yang digunakan

  const RECOMMENDATION_SERVICE_URL = 'http://localhost:8004'; // Base URL for your Recommendation Service
  const IOT_SERVICE_URL = 'http://localhost:8001'; // Base URL for your IoT Service
  const PREDICTION_SERVICE_URL = 'http://localhost:8003'; // Base URL for your Prediction Service

  // Function to fetch latest sensor data, get predictions, and then get recommendations
  const fetchSensorPredictAndRecommend = async () => {
    setLoading(true);
    setError(null);
    setRecommendations(null);
    setIssuesDetected(null);
    setLatestSensorDataFetched(null);
    setLatestPredictionResultsFetched(null);

    try {
      const token = localStorage.getItem('access_token'); // Get token from localStorage
      if (!token) {
        throw new Error("Autentikasi diperlukan. Silakan login kembali.");
      }

      // --- Step 1: Fetch latest sensor data from IoT Service ---
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
        throw new Error("Tidak ada data sensor terbaru untuk menghasilkan rekomendasi. Silakan kirim data sensor terlebih dahulu.");
      }

      const latestSensor = sensorData[sensorData.length - 1];
      setLatestSensorDataFetched(latestSensor); // Store sensor data used

      // Create prediction input from latest sensor data
      const predictionInput = {
        nitrogen: latestSensor.nitrogen,
        phosphorus: latestSensor.phosphorus,
        potassium: latestSensor.potassium,
        ph: latestSensor.ph,
        temperature: latestSensor.temperature,
        humidity: latestSensor.humidity,
      };

      // --- Step 2: Get predictions from Prediction Service ---
      // Fetch Harvest Prediction
      const harvestResponse = await fetch(`${PREDICTION_SERVICE_URL}/predict/harvest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(predictionInput),
      });
      if (!harvestResponse.ok) {
        const errorData = await harvestResponse.json();
        throw new Error(`Gagal mendapatkan prediksi panen: ${errorData.detail || harvestResponse.statusText}`);
      }
      const harvestData = await harvestResponse.json();

      // Fetch Pest Risk Prediction
      const pestResponse = await fetch(`${PREDICTION_SERVICE_URL}/predict/pest_risk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(predictionInput),
      });
      if (!pestResponse.ok) {
        const errorData = await pestResponse.json();
        throw new Error(`Gagal mendapatkan prediksi risiko hama: ${errorData.detail || pestResponse.statusText}`);
      }
      const pestData = await pestResponse.json();

      setLatestPredictionResultsFetched({ // Store prediction data used
        harvest: harvestData.prediction,
        pest: pestData.prediction,
      });

      // --- Step 3: Send combined data to Recommendation Service ---
      const recommendationInput = {
        nitrogen: latestSensor.nitrogen,
        phosphorus: latestSensor.phosphorus,
        potassium: latestSensor.potassium,
        ph: latestSensor.ph,
        temperature: latestSensor.temperature,
        humidity: latestSensor.humidity,
        estimated_yield_kg: harvestData.prediction.estimated_yield_kg,
        yield_category: harvestData.prediction.yield_category,
        pest_risk_level: pestData.prediction.risk_level,
        // Add contextInput data here if your backend recommendation service uses it
        // ...contextInput, 
      };

      const recommendationResponse = await fetch(`${RECOMMENDATION_SERVICE_URL}/get_recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recommendationInput),
      });

      if (!recommendationResponse.ok) {
        const errorData = await recommendationResponse.json();
        throw new Error(`Gagal mendapatkan rekomendasi: ${errorData.detail || recommendationResponse.statusText}`);
      }
      const recData = await recommendationResponse.json();
      setRecommendations(recData.recommendations);
      setIssuesDetected(recData.issues_detected);

    } catch (e) {
      setError("Error: " + e.message);
      console.error("Error fetching recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Rekomendasi Pertanian</h2>

      {/* Button to trigger fetching recommendations */}
      <div className="mb-8 text-center">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <button
          onClick={fetchSensorPredictAndRecommend}
          className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:shadow-outline transition duration-300"
          disabled={loading}
        >
          {loading ? 'Memuat Rekomendasi...' : 'Dapatkan Rekomendasi Sekarang'}
        </button>
      </div>

      {/* Display data used for recommendation */}
      {(latestSensorDataFetched || latestPredictionResultsFetched) && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 mb-8">
          <p className="font-semibold mb-1">Data yang Digunakan untuk Rekomendasi:</p>
          {latestSensorDataFetched && (
            <ul className="list-disc list-inside grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <p className="font-semibold text-gray-600 mb-1 col-span-full">Data Sensor:</p>
              {Object.entries(latestSensorDataFetched).map(([key, value]) => {
                if (key === 'id' || key === 'timestamp') return null;
                const label = key.replace(/([A-Z])/g, ' $1').trim().charAt(0).toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1);
                return <li key={`sensor-${key}`}>{label}: {value}</li>;
              })}
              <p className="mt-2 text-xs text-gray-500 col-span-full">Timestamp Sensor: {new Date(latestSensorDataFetched.timestamp).toLocaleString()}</p>
            </ul>
          )}
          {latestPredictionResultsFetched && (
            <ul className="list-disc list-inside mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <p className="font-semibold text-gray-600 mb-1 col-span-full">Hasil Prediksi:</p>
              <li>Estimasi Panen: {latestPredictionResultsFetched.harvest.estimated_yield_kg} kg ({latestPredictionResultsFetched.harvest.yield_category})</li>
              <li>Risiko Hama: {latestPredictionResultsFetched.pest.risk_level} (Skor: {latestPredictionResultsFetched.pest.risk_score})</li>
            </ul>
          )}
        </div>
      )}

      {/* Recommendation Results Area */}
      {recommendations || issuesDetected ? (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Hasil Rekomendasi</h3>
          {issuesDetected && issuesDetected.length > 0 && (
            <div className="bg-orange-100 text-orange-700 p-4 rounded-lg mb-4 border border-orange-200">
              <p className="font-bold mb-2">Masalah Terdeteksi:</p>
              <ul className="list-disc list-inside">
                {issuesDetected.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {recommendations && recommendations.length > 0 ? (
            <div className="bg-green-50 p-6 rounded-lg shadow-sm border border-green-200">
              <p className="font-bold mb-2 text-green-800">Rekomendasi Tindakan:</p>
              <ul className="list-disc list-inside">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200 text-gray-700">
              <p className="font-bold">Tidak ada rekomendasi spesifik saat ini.</p>
              <p className="text-sm">Kondisi lahan mungkin sudah optimal atau tidak ada masalah yang terdeteksi.</p>
            </div>
          )}
        </div>
      ) : (
        // This will be displayed if no results are available after loading
        <div className="text-center text-gray-600 p-8">
            Klik "Dapatkan Rekomendasi Sekarang" untuk melihat saran.
        </div>
      )}
    </div>
  );
};

export default RecommendationPage;