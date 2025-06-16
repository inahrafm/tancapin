import React, { useState } from 'react';

const ReportPage = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  // State for date range filter
  const [dateRange, setDateRange] = useState('All Data'); // Default: Unduh semua data
  // States for custom date range
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const REPORT_SERVICE_URL = 'http://localhost:8005'; // Base URL for your Report Service

  const handleDownloadReport = async () => {
    setLoading(true);
    setMessage('');
    setError(null);

    try {
      const token = localStorage.getItem('access_token'); // Get token from localStorage
      if (!token) {
        throw new Error("Autentikasi diperlukan. Silakan login kembali.");
      }

      let apiUrl = `${REPORT_SERVICE_URL}/reports/sensor_data_excel`;
      
      // Logika untuk menambahkan parameter filter ke URL
      const params = new URLSearchParams();
      const now = new Date();
      let startFilterTime;
      let endFilterTime = now;

      switch (dateRange) {
        case 'Today':
          startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'Yesterday':
          startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          endFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
          break;
        case 'Last 7 Days':
          startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          break;
        case 'Last 30 Days':
          startFilterTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
          break;
        case 'This Month':
          startFilterTime = new Date(now.getFullYear(), now.getMonth(), 1);
          endFilterTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Last day of current month
          break;
        case 'Last Month':
          startFilterTime = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endFilterTime = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999); // Last day of previous month
          break;
        case 'Last Year':
          startFilterTime = new Date(now.getFullYear() - 1, 0, 1);
          endFilterTime = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
          break;
        case 'Custom Range':
          if (customStartDate && customEndDate) {
            startFilterTime = new Date(customStartDate);
            startFilterTime.setHours(0, 0, 0, 0);
            endFilterTime = new Date(customEndDate);
            endFilterTime.setHours(23, 59, 59, 999);
            if (startFilterTime > endFilterTime) {
                [startFilterTime, endFilterTime] = [endFilterTime, startFilterTime]; // Swap if dates are inverted
            }
          } else {
            setError("Untuk 'Rentang Kustom', tanggal mulai dan akhir harus diisi.");
            setLoading(false);
            return;
          }
          break;
        case 'All Data':
        default:
          // No specific timestamps needed, backend will return all data by default
          break;
      }

      if (dateRange !== 'All Data') {
          params.append('start_timestamp', startFilterTime.toISOString());
          params.append('end_timestamp', endFilterTime.toISOString());
      }
      
      const queryString = params.toString();
      if (queryString) {
          apiUrl = `${apiUrl}?${queryString}`;
      }

      const response = await fetch(apiUrl, {
        method: 'GET', // Use GET method for downloading files
        headers: {
          'Authorization': `Bearer ${token}`, // Include JWT token in header
        },
      });

      if (!response.ok) {
        let errorMsg = `Gagal mengunduh laporan: HTTP error! status: ${response.status}`;
        if (response.status === 404) { // Menangani kasus jika tidak ada data untuk rentang tsb
          errorMsg = "Tidak ada data yang ditemukan untuk rentang tanggal ini.";
        } else if (response.status === 401) {
          errorMsg = "Sesi kadaluwarsa atau tidak valid. Silakan login kembali.";
          localStorage.removeItem('access_token'); // Hapus token
          //window.location.reload(); // Mungkin perlu refresh halaman
        } else {
            try {
              const errorData = await response.json(); // Try to parse error message from JSON
              errorMsg = `Gagal mengunduh laporan: ${errorData.detail || response.statusText}`;
            } catch (parseError) {
              // If response is not JSON, use default error message
              errorMsg = `Gagal mengunduh laporan: ${response.statusText}`;
            }
        }
        throw new Error(errorMsg);
      }

      // If response is OK, create a Blob from the response and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'laporan_sensor.xlsx'; // Default filename
      if (contentDisposition && contentDisposition.includes('filename=')) {
          filename = contentDisposition.split('filename=')[1].split(';')[0].replace(/"/g, '');
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Clean up the URL object

      setMessage(`Laporan '${filename}' berhasil diunduh.`);
    } catch (e) {
      setError("Error: " + e.message);
      console.error("Error downloading report:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Laporan Data Pertanian</h2>

      <div className="mb-8 text-center">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}
        <p className="text-gray-700 mb-4">
          Pilih rentang tanggal untuk laporan, lalu klik tombol di bawah untuk mengunduh laporan data sensor historis dalam format Excel.
        </p>
        
        {/* Date Range Filter for Reports */}
        <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="relative">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                value={dateRange}
                onChange={(e) => {
                    setDateRange(e.target.value);
                    if (e.target.value !== 'Custom Range') {
                        setCustomStartDate('');
                        setCustomEndDate('');
                    }
                }}
              >
                <option value="All Data">Semua Data</option>
                <option value="Last 30 Days">30 Hari Terakhir</option>
                <option value="Last 7 Days">7 Hari Terakhir</option>
                <option value="Yesterday">Kemarin</option>
                <option value="Today">Hari Ini</option>
                <option value="This Month">Bulan Ini</option>
                <option value="Last Month">Bulan Lalu</option>
                <option value="Last Year">Tahun Lalu</option>
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

        <button
          onClick={handleDownloadReport}
          className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:shadow-outline transition duration-300"
          disabled={loading}
        >
          {loading ? 'Mengunduh Laporan...' : 'Unduh Laporan Excel'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-600">
        <p>Catatan: Laporan ini akan menyertakan data yang difilter sesuai dengan rentang tanggal yang Anda pilih.</p>
      </div>
    </div>
  );
};

export default ReportPage;