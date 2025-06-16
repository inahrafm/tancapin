import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to round numbers
const round = (value, decimals) => {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
};

const DashboardPage = () => {
  const [sensorData, setSensorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for the currently selected metric for the graph
  const [selectedGraphMetric, setSelectedGraphMetric] = useState('temperature'); // Default to temperature

  // State for date range filter
  const [dateRange, setDateRange] = useState('Last 30 Days'); // Default date range
  // States for custom date range
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const IOT_SERVICE_URL = 'http://localhost:8001'; // Base URL for your IoT Service

  // Object to map metric names to more readable labels
  const metricLabels = {
    humidity: 'Kelembaban Udara',
    temperature: 'Suhu',
    nitrogen: 'Nitrogen',
    phosphorus: 'Fosfor',
    potassium: 'Kalium',
    ph: 'pH Tanah',
  };

  // Object to map metric names to units
  const metricUnits = {
    humidity: '%',
    temperature: '°C',
    nitrogen: 'ppm',
    phosphorus: 'ppm',
    potassium: 'ppm',
    ph: '', // pH has no common unit
  };


  // Fetch data from IoT Service
  const fetchSensorData = async () => {
    try {
      const token = localStorage.getItem('access_token'); // Ambil token dari localStorage
      if (!token) {
        setError("Autentikasi diperlukan. Silakan login.");
        setLoading(false);
        setSensorData([]); // Pastikan data kosong jika tidak ada token
        return; // Hentikan fungsi jika tidak ada token
      }

      const response = await fetch(`${IOT_SERVICE_URL}/data/sensor/all`, {
        headers: {
          'Authorization': `Bearer ${token}`, // <-- SERTAKAN TOKEN JWT DI SINI
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (response.status === 401) {
          errorMessage = "Sesi kadaluwarsa atau tidak valid. Silakan login kembali.";
          // Opsi: Hapus token dan picu logout jika ini terjadi
          // localStorage.removeItem('access_token');
          // window.location.reload(); 
        } else {
            // Coba parsing error dari JSON jika ada
            const errorData = await response.json();
            errorMessage = errorData.detail || errorMessage;
        }
        setSensorData([]); // Pastikan data dikosongkan saat error
        throw new Error(errorMessage); // Lempar error untuk ditangkap catch block
      }
      
      const data = await response.json();
      // Pastikan data adalah array sebelum memanggil sort
      if (!Array.isArray(data)) {
          console.error("Data fetched is not an array:", data);
          throw new Error("Format data yang diterima tidak sesuai.");
      }
      data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sorting hanya jika data adalah array
      setSensorData(data);
      setError(null); // Reset error jika fetch berhasil
    } catch (e) {
      setError("Gagal memuat data sensor: " + e.message);
      console.error("Error fetching sensor data:", e);
      setSensorData([]); // Clear data if there's an error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorData();
    // Refresh data every 10 seconds
    const interval = setInterval(fetchSensorData, 10000); // Fetch every 10 detik
    return () => clearInterval(interval); // Cleanup interval when component unmounts
  }, []);

  // Filter sensor data based on date range
  const getFilteredSensorData = () => {
    if (!sensorData.length) return [];

    const now = new Date();
    let startFilterTime;
    let endFilterTime = now; // Default end time to now

    switch (dateRange) {
      case 'Today':
        startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'Yesterday':
        startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        endFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999); // End of yesterday
        break;
      case 'Last 7 Days':
        startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'Last 30 Days':
        startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'Custom Range':
        // Ensure custom dates are valid before filtering
        if (customStartDate) {
          startFilterTime = new Date(customStartDate);
          // Set time to beginning of the day for start date
          startFilterTime.setHours(0, 0, 0, 0);
        } else {
            return []; // No start date, return empty
        }
        
        if (customEndDate) {
            endFilterTime = new Date(customEndDate);
            // Set time to end of the day for end date
            endFilterTime.setHours(23, 59, 59, 999);
        } else {
            endFilterTime = now; // If no end date, default to now
        }

        if (startFilterTime > endFilterTime) {
            // Swap if start is after end
            [startFilterTime, endFilterTime] = [endFilterTime, startFilterTime];
        }
        break;
      default:
        return sensorData; // Show all data if no specific range or custom
    }

    return sensorData.filter(d => {
        const timestamp = new Date(d.timestamp);
        return timestamp >= startFilterTime && timestamp <= endFilterTime;
    });
  };

  const filteredGraphData = getFilteredSensorData();

  // Aggregate data by day if date range is > 1 day
  const getAggregatedData = () => {
    const isDailyView = ['Last 7 Days', 'Last 30 Days'].includes(dateRange) || 
                       (dateRange === 'Custom Range' && 
                        customStartDate && customEndDate && 
                        (new Date(customEndDate).getTime() - new Date(customStartDate).getTime() > 24 * 60 * 60 * 1000)); // More than 1 day

    if (!isDailyView) {
      // Return raw filtered data if showing hourly/intra-day
      return {
        labels: filteredGraphData.map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        data: filteredGraphData.map(d => d[selectedGraphMetric]),
        xLabel: 'Waktu',
      };
    }

    // Aggregate data by day
    const dailyData = {};
    filteredGraphData.forEach(d => {
      const date = new Date(d.timestamp);
      const dateKey = date.toISOString().split('T')[0]; // Formatúrese-MM-DD
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { sum: 0, count: 0 };
      }
      dailyData[dateKey].sum += d[selectedGraphMetric];
      dailyData[dateKey].count += 1;
    });

    const labels = Object.keys(dailyData).sort(); // Sort dates
    const data = labels.map(key => 
      round(dailyData[key].sum / dailyData[key].count, 1) // Average per day
    );

    return {
      labels: labels.map(dateStr => new Date(dateStr).toLocaleDateString([], { month: 'short', day: '2-digit' })),
      data: data,
      xLabel: 'Tanggal',
    };
  };

  const { labels: chartLabels, data: chartValues, xLabel: chartXAxisLabel } = getAggregatedData();


  // Prepare data for the graph based on selectedGraphMetric
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: metricLabels[selectedGraphMetric] || selectedGraphMetric.charAt(0).toUpperCase() + selectedGraphMetric.slice(1),
        data: chartValues,
        borderColor: 'rgba(75, 192, 192, 1)', // Default color, can be customized per metric
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3, // Smoother lines
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows flexible height
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `Data Historis untuk ${metricLabels[selectedGraphMetric] || selectedGraphMetric.charAt(0).toUpperCase() + selectedGraphMetric.slice(1)}`,
        font: {
          size: 18,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} ${metricUnits[selectedGraphMetric]}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: chartXAxisLabel, // Dynamic X-axis label
          font: {
            size: 14,
          },
        },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10, // Limit number of ticks to avoid clutter
        },
      },
      y: {
        title: {
          display: true,
          text: `Nilai (${metricUnits[selectedGraphMetric]})`,
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // Get latest sensor data for cards
  const latestSensorData = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  // Handle click on sensor card to update graph metric
  const handleCardClick = (metric) => {
    setSelectedGraphMetric(metric);
  };

  if (loading) {
    return <div className="text-center p-6">Memuat data dashboard...</div>;
  }

  // Error fetching initially, maybe no data or CORS/connection issue
  if (error) { // Perbarui kondisi error handling
    return (
      <div className="p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          Error: {error} {error.includes("Autentikasi") || error.includes("valid") ? "" : "Pastikan IoT Service berjalan."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Main Data Summary Section (Data Cards) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Sensor Terbaru</h2>
        {latestSensorData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.keys(metricLabels).map((key) => { // Iterate over metricLabels to ensure consistent order
              const value = latestSensorData[key];
              const label = metricLabels[key];
              const unit = metricUnits[key];
              
              // Define icon background colors
              const iconBgColor = {
                nitrogen: 'bg-yellow-50 text-yellow-600',
                phosphorus: 'bg-indigo-50 text-indigo-600',
                potassium: 'bg-pink-50 text-pink-600',
                ph: 'bg-green-50 text-green-600',
                temperature: 'bg-purple-50 text-purple-600',
                humidity: 'bg-blue-50 text-blue-600',
              }[key] || 'bg-gray-50 text-gray-600';


              return (
                <div 
                  key={key} 
                  className="bg-white border border-gray-100 p-5 rounded-lg shadow-sm flex flex-col items-center cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleCardClick(key)} // Call handleCardClick
                >
                  <div className={`${iconBgColor} rounded-full p-3 mb-3`}>
                    {/* Placeholder Icons */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-6.002-7.74M6 6V5a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 00.707.293h3.75a1 1 0 011 1v2M6 10v3.586l.707.707a1 1 0 001.707-.707V10m0 0a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 00.707.293H20M12 18h.01"></path></svg>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-800">{value} {unit}</p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 text-center">Tidak ada data sensor yang tersedia.</p>
        )}
      </div>

      {/* Historical Data Graph Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Data Historis untuk {metricLabels[selectedGraphMetric] || 'Metrik Terpilih'}
          </h2>
          <div className="flex items-center space-x-2"> {/* Group select and custom date inputs */}
            <div className="relative">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={dateRange}
                onChange={(e) => {
                    setDateRange(e.target.value);
                    // Clear custom dates if not 'Custom Range'
                    if (e.target.value !== 'Custom Range') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                    }
                }}
              >
                <option value="Last 30 Days">30 Hari Terakhir</option>
                <option value="Last 7 Days">7 Hari Terakhir</option>
                <option value="Yesterday">Kemarin</option>
                <option value="Today">Hari Ini</option>
                <option value="Custom Range">Rentang Kustom</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            {dateRange === 'Custom Range' && (
                <>
                    <input
                        type="date"
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="date"
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                </>
            )}
          </div>
        </div>
        {filteredGraphData.length > 0 ? (
          <div style={{ height: '400px' }}> {/* Set a fixed height for the chart container */}
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <p className="text-gray-600 text-center">Tidak ada data historis yang tersedia untuk metrik/rentang ini.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;