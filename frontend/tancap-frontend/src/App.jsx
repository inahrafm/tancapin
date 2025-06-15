import React, { useState } from 'react'; // Impor useState

// --- Placeholder Komponen Halaman ---
// Nantinya, ini akan menjadi komponen React terpisah di file masing-masing
const DashboardContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard Utama</h2>
    <p className="text-gray-700">Ini adalah konten untuk Dashboard. Akan menampilkan data IoT dan ringkasan.</p>
    {/* Anda bisa menambahkan bagian Filter Lokasi di sini */}
    {/* Bagian Ringkasan Data Utama (akan diisi dengan kartu-kartu data) */}
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Ringkasan Sistem</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Contoh Kartu Informasi - Disesuaikan dengan gaya modern simple */}
        <div className="bg-white border border-gray-100 p-5 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-blue-50 text-blue-600 rounded-full p-3 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0020 13a8 8 0 00-6.002-7.74M6 6V5a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 00.707.293h3.75a1 1 0 011 1v2M6 10v3.586l.707.707a1 1 0 001.707-.707V10m0 0a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 00.707.293H20M12 18h.01"></path></svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">Kelembaban Udara</p>
          <p className="text-2xl font-bold text-gray-800">93.2 %</p>
          <span className="text-xs text-green-500 mt-1">Optimal</span>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-purple-50 text-purple-600 rounded-full p-3 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h10M7 16h10"></path></svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">Suhu Tanah</p>
          <p className="text-2xl font-bold text-gray-800">28.3 °C</p>
          <span className="text-xs text-gray-500 mt-1">Normal</span>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-yellow-50 text-yellow-600 rounded-full p-3 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M15 6l-3-3m0 0L9 6m0 12l3 3m0 0l3-3"></path></svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">Nitrogen</p>
          <p className="text-2xl font-bold text-gray-800">87 ppm</p>
          <span className="text-xs text-orange-500 mt-1">Perlu Dipantau</span>
        </div>

        <div className="bg-white border border-gray-100 p-5 rounded-lg shadow-sm flex flex-col items-center">
          <div className="bg-green-50 text-green-600 rounded-full p-3 mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
          <p className="text-sm text-gray-500 mb-1">pH Tanah</p>
          <p className="text-2xl font-bold text-gray-800">7.3</p>
          <span className="text-xs text-green-500 mt-1">Stabil</span>
        </div>
      </div>
    </div>
  </div>
);
const PredictionContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Prediksi Hasil & Risiko</h2>
    <p className="text-gray-700">Ini adalah konten untuk halaman Prediksi. Di sini akan ditampilkan form input data untuk prediksi dan hasilnya.</p>
  </div>
);
const RecommendationContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Rekomendasi Pertanian</h2>
    <p className="text-gray-700">Ini adalah konten untuk halaman Rekomendasi. Saran pemupukan, penyiraman, dll. akan muncul di sini.</p>
  </div>
);
const UserContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Manajemen Pengguna</h2>
    <p className="text-gray-700">Ini adalah konten untuk halaman Pengguna. Akan ada daftar user, pengaturan profil, dll.</p>
  </div>
);
const ReportContent = () => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Laporan & Analisis</h2>
    <p className="text-gray-700">Ini adalah konten untuk halaman Laporan. Tombol untuk mengunduh laporan Excel akan ada di sini.</p>
  </div>
);

// --- Komponen Login/Register yang Diperbarui untuk Terhubung ke Backend ---
const LoginRegisterPage = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); // true: Login, false: Register
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Untuk pesan sukses/error
  const [loading, setLoading] = useState(false); // Untuk indikator loading

  const USER_SERVICE_URL = 'http://localhost:8002'; // URL dasar untuk User Service Anda

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Reset pesan
    setLoading(true); // Mulai loading

    try {
      if (isLoginMode) {
        // Logika untuk Login - Menggunakan FormData sesuai FastAPI OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${USER_SERVICE_URL}/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded', // Penting untuk FormData
          },
          body: formData.toString(), // Kirim FormData sebagai string URL-encoded
        });

        if (response.ok) {
          const data = await response.json();
          setMessage('Login berhasil! Mengarahkan ke Dashboard...');
          // Simpan token di localStorage (atau React Context nanti)
          localStorage.setItem('access_token', data.access_token);
          onLoginSuccess(username); // Panggil fungsi di App untuk update status login
        } else {
          const errorData = await response.json();
          setMessage(`Login gagal: ${errorData.detail || 'Username atau password salah.'}`);
        }
      } else {
        // Logika untuk Register - Menggunakan JSON
        const response = await fetch(`${USER_SERVICE_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(`Registrasi berhasil: ${data.message}. Silakan Login.`);
          setIsLoginMode(true); // Kembali ke mode login setelah register
          setUsername(''); // Kosongkan form setelah sukses register
          setPassword('');
        } else {
          const errorData = await response.json();
          setMessage(`Registrasi gagal: ${errorData.detail || 'Terjadi kesalahan.'}`);
        }
      }
    } catch (error) {
      console.error('Error saat menghubungi layanan autentikasi:', error);
      setMessage('Terjadi masalah jaringan atau server. Coba lagi nanti.');
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter text-gray-800"> {/* Mengisi seluruh layar */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {isLoginMode ? 'Login' : 'Registrasi'} Akun
        </h2>

        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${message.includes('gagal') || message.includes('masalah') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              placeholder="Masukkan username Anda"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
              placeholder="Masukkan password Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:shadow-outline transition duration-300"
            disabled={loading}
          >
            {loading ? (isLoginMode ? 'Logging in...' : 'Registering...') : (isLoginMode ? 'Login' : 'Daftar')}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          {isLoginMode ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setMessage(''); // Reset pesan saat beralih mode
            }}
            className="text-green-600 hover:text-green-800 font-bold ml-2 focus:outline-none"
            disabled={loading}
          >
            {isLoginMode ? 'Daftar Sekarang' : 'Login di Sini'}
          </button>
        </p>
      </div>
    </div>
  );
};

function App() {
  // State untuk melacak halaman yang sedang aktif
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // State untuk status login
  const [username, setUsername] = useState(''); // State untuk menyimpan username yang login

  // Effect untuk mengecek token saat aplikasi dimuat
  React.useEffect(() => {
    const token = localStorage.getItem('access_token');
    // Untuk pengembangan, kita bisa asumsikan jika ada token, maka sudah login
    // Di produksi, token ini perlu divalidasi ke backend.
    if (token) {
      // Anda bisa dekode JWT untuk mendapatkan username jika perlu, atau simpan username saat login
      // Untuk simulasi, kita asumsikan username dari token
      setIsLoggedIn(true);
      // Mendapatkan username dari token JWT (contoh sederhana, bisa lebih robust)
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setUsername(decodedPayload.sub || 'Pengguna'); // 'sub' adalah subjek (biasanya username)
      } catch (e) {
        console.error('Failed to decode token:', e);
        setUsername('Pengguna');
      }
      setCurrentPage('dashboard');
    }
  }, []); // Hanya berjalan sekali saat komponen mount

  // Fungsi untuk menangani klik navigasi
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Fungsi untuk menangani login berhasil
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    setCurrentPage('dashboard'); // Redirect ke dashboard setelah login
  };

  // Render konten sesuai dengan currentPage
  const renderContent = () => {
    // Jika belum login, tampilkan halaman Login/Register saja tanpa sidebar
    if (!isLoggedIn) {
      return <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardContent />;
      case 'prediction':
        return <PredictionContent />;
      case 'recommendation':
        return <RecommendationContent />;
      case 'user':
        return <UserContent />;
      case 'report':
        return <ReportContent />;
      case 'login': // Jika sudah login tapi mencoba ke /login lagi, tetap tampilkan LoginRegisterPage
        return <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <DashboardContent />; // Default ke dashboard
    }
  };

  return (
    // Kontainer utama aplikasi - kini memenuhi seluruh lebar layar, dengan latar belakang bersih
    // Render kondisional seluruh layout aplikasi berdasarkan isLoggedIn
    isLoggedIn ? (
      <div className="flex min-h-screen bg-gray-100 font-inter text-gray-800">
        
        {/* Sidebar Navigasi Tetap - Lebih ramping dan bersih */}
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between fixed h-full overflow-y-auto">
          <div>
            {/* Logo atau Nama Aplikasi - Menggunakan ikon dengan gradien warna dari contoh */}
            <div className="flex items-center justify-center lg:justify-start mb-10 mt-2">
              <span className="text-4xl mr-2">
                {/* SVG Ikon Tancap dengan Gradien Hijau */}
                <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="url(#paint0_linear_logo)"/>
                  <path d="M12.7844 23.36V8.64H15.0244L19.4644 19.344H19.5204L24.0804 8.64H26.2564V23.36H24.0164V12.656H23.9604L19.5204 23.36H19.4644L15.0244 12.656H14.9684V23.36H12.7844Z" fill="white"/>
                  <path d="M13.6161 7.232C13.6161 6.368 13.3761 5.616 12.8961 4.976C12.4321 4.352 11.8081 3.872 11.0241 3.536C10.2561 3.2 9.3921 3.024 8.4321 3.024C7.4721 3.024 6.6081 3.2 5.8401 3.536C5.0721 3.872 4.4481 4.352 3.9841 4.976C3.5201 5.616 3.2801 6.368 3.2801 7.232C3.2801 8.096 3.5201 8.848 3.9841 9.488C4.4481 10.112 5.0721 10.592 5.8401 10.928C6.6081 11.264 7.4721 11.44 8.4321 11.44C9.3921 11.44 10.2561 11.264 11.0241 10.928C11.8081 10.592 12.4321 10.112 12.8961 9.488C13.3761 8.848 13.6161 8.096 13.6161 7.232ZM11.4561 7.232C11.4561 7.696 11.3601 8.088 11.1681 8.392C10.9921 8.712 10.7041 8.968 10.2961 9.16C9.8881 9.352 9.4081 9.448 8.8721 9.448C8.3521 9.448 7.8721 9.352 7.4321 9.16C7.0081 8.968 6.6721 8.712 6.4321 8.392C6.2081 8.088 6.0801 7.696 6.0801 7.232C6.0801 6.768 6.2081 6.376 6.4321 6.064C6.6721 5.76 7.0081 5.512 7.4321 5.328C7.8721 5.144 8.3521 5.056 8.8721 5.056C9.4081 5.056 9.8881 5.144 10.2961 5.328C10.7041 5.512 10.9921 5.76 11.1681 6.064C11.3601 6.376 11.4561 6.768 11.4561 7.232Z" fill="white"/>
                  <defs>
                    <linearGradient id="paint0_linear_logo" x1="16" y1="0" x2="16" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#A1F6A1"/>
                      <stop offset="1" stopColor="#34B479"/>
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <h1 className="text-2xl font-bold text-gray-800">Tancap</h1> {/* Nama aplikasi selalu terlihat */}
            </div>

            {/* Navigasi Utama */}
            <nav className="mb-8">
              <ul className="space-y-2">
                <li>
                  {/* Dashboard (Data IoT & Ringkasan) */}
                  <a 
                    href="#" 
                    onClick={() => handleNavigation('dashboard')} 
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === 'dashboard' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-11 7v-3m0 3v-3m0 3h-3m3 0h3"></path></svg>
                    <span>Dashboard</span>
                  </a>
                </li>
                <li>
                  {/* Prediksi */}
                  <a 
                    href="#" 
                    onClick={() => handleNavigation('prediction')} 
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === 'prediction' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9m11 0a2 2 0 002 2v6a2 2 0 00-2 2h-2m-8-2h8"></path></svg>
                    <span>Prediksi</span>
                  </a>
                </li>
                <li>
                  {/* Rekomendasi */}
                  <a 
                    href="#" 
                    onClick={() => handleNavigation('recommendation')} 
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === 'recommendation' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM12 10.5c-.276 0-.5.224-.5.5s.224.5.5.5.5-.224.5-.5-.224-.5-.5-.5zM12 18V6"></path></svg>
                    <span>Rekomendasi</span>
                  </a>
                </li>
                <li>
                  {/* Pengguna (Manajemen User) */}
                  <a 
                    href="#" 
                    onClick={() => handleNavigation('user')} 
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === 'user' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h2a2 2 0 002-2V8a2 2 0 00-2-2h-2M3 12L5 14L8 11M3 8h2M3 16h2M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <span>Pengguna</span>
                  </a>
                </li>
                <li>
                  {/* Laporan */}
                  <a 
                    href="#" 
                    onClick={() => handleNavigation('report')} 
                    className={`flex items-center p-3 rounded-lg transition-all duration-200 ${currentPage === 'report' ? 'text-green-700 bg-green-50' : 'text-gray-700 hover:text-green-700 hover:bg-green-50'}`}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0h10a2 2 0 002-2V7a2 2 0 00-2-2H9m11 0a2 2 0 002 2v6a2 2 0 00-2 2h-2m-8-2h8"></path></svg>
                    <span>Laporan</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          {/* Info Pengguna atau Logout */}
          <div className="mt-auto border-t pt-4 border-gray-100">
            {isLoggedIn ? (
              <>
                <div className="flex items-center p-3 rounded-lg bg-gray-50 text-gray-700 justify-center lg:justify-start">
                  <span className="text-xl mr-3">👤</span>
                  <span>{username}</span>
                </div>
                <button 
                  onClick={() => handleLoginSuccess('')} // Simulasikan logout
                  className="w-full mt-4 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              // Tombol Login/Register di sidebar hanya terlihat jika sudah login
              // Karena jika belum login, seluruh sidebar tidak akan di-render.
              // Jadi tombol ini tidak akan pernah terlihat dalam kondisi belum login.
              // Ini hanya sebagai placeholder untuk navigasi internal jika user bisa pindah ke login dari halaman lain.
              <button 
                onClick={() => handleNavigation('login')} 
                className="w-full mt-4 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Login / Register
              </button>
            )}
          </div>
        </aside>

        {/* Konten Utama & Header Top - Fleksibel */}
        <div className="flex-1 flex flex-col pl-64"> {/* Padding kiri untuk menyeimbangkan sidebar */}
          {/* Header Top - Lebih simpel dan menyatu dengan konten */}
          <header className="bg-white p-4 shadow-sm border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{currentPage === 'login' ? 'Autentikasi Pengguna' : (currentPage.charAt(0).toUpperCase() + currentPage.slice(1))}</h2> {/* Judul halaman dinamis */}
            {currentPage === 'dashboard' && isLoggedIn && ( // Tampilkan tombol export hanya di Dashboard jika sudah login
              <button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition duration-300">
                Export Data
              </button>
            )}
          </header>

          {/* Area Konten Utama yang Dapat Discroll */}
          <main className="flex-grow p-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    ) : (
      // Jika belum login, hanya render halaman LoginRegisterPage yang mengambil seluruh layar
      <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />
    )
  );
}

export default App;
