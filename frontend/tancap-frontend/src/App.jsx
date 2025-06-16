import React, { useState, useEffect } from 'react';
import DashboardPage from './DashboardPage';
import PredictionPage from './PredictionPage';
import RecommendationPage from './RecommendationPage';
import ReportPage from './ReportPage'; 
import UserManagementPage from './UserManagementPage'; // Impor komponen UserManagementPage
import logoTancap from './assets/logo-tancap.png'; // <--- IMPORT LOGO ANDA DI SINI

// Komponen LoginRegisterPage
const LoginRegisterPage = ({ onLoginSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // State untuk email
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const USER_SERVICE_URL = 'http://localhost:8002';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isLoginMode) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${USER_SERVICE_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });

        if (response.ok) {
          const data = await response.json();
          setMessage('Login berhasil! Mengarahkan ke Dashboard...');
          localStorage.setItem('access_token', data.access_token);
          onLoginSuccess(username);
        } else {
          const errorData = await response.json();
          setMessage(`Login gagal: ${errorData.detail || 'Username atau password salah.'}`);
        }
      } else {
        const response = await fetch(`${USER_SERVICE_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          setMessage(`Registrasi berhasil: ${data.message}. Silakan Login.`);
          setIsLoginMode(true);
          setUsername('');
          setEmail('');
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
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-inter text-gray-800">
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
          {!isLoginMode && (
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}
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
            {loading ? (isLoginMode ? 'Logging in...' : 'Registering... ') : (isLoginMode ? 'Login' : 'Daftar')}
          </button>
        </form>

        <p className="text-center text-gray-600 text-sm mt-6">
          {isLoginMode ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setMessage('');
              setUsername('');
              setEmail('');
              setPassword('');
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
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  // Effect untuk mengecek token saat aplikasi dimuat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setUsername(decodedPayload.sub || 'Pengguna');
      } catch (e) {
        console.error('Gagal mendekode token:', e);
        setUsername('Pengguna');
      }
      setCurrentPage('dashboard');
    }
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsLoggedIn(false);
    setUsername('');
    setCurrentPage('login');
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'prediction':
        return <PredictionPage />;
      case 'recommendation':
        return <RecommendationPage />;
      case 'user':
        return <UserManagementPage />; // Render UserManagementPage
      case 'report':
        return <ReportPage />; 
      case 'login':
        return <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    isLoggedIn ? (
      <div className="flex min-h-screen bg-gray-100 font-inter text-gray-800">
        
        {/* Sidebar Navigasi Tetap */}
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col justify-between fixed h-full overflow-y-auto">
          <div>
            {/* Logo atau Nama Aplikasi */}
            <div className="flex items-center justify-center lg:justify-start mb-10 mt-2">
              {/* Menggunakan tag <img> untuk logo PNG Anda */}
              <img src={logoTancap} alt="Tancap Logo" className="w-10 h-10 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">Tancap</h1>
            </div>

            {/* Navigasi Utama */}
            <nav className="mb-8">
              <ul className="space-y-2">
                <li>
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
                  onClick={handleLogout}
                  className="w-full mt-4 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleNavigation('login')} 
                className="w-full mt-4 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                Login / Register
              </button>
            )}
          </div>
        </aside>

        {/* Konten Utama & Header Top */}
        <div className="flex-1 flex flex-col pl-64">
          <header className="bg-white p-4 shadow-sm border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">{currentPage === 'login' ? 'Autentikasi Pengguna' : (currentPage.charAt(0).toUpperCase() + currentPage.slice(1))}</h2>
          </header>

          <main className="flex-grow p-6 overflow-y-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    ) : (
      <LoginRegisterPage onLoginSuccess={handleLoginSuccess} />
    )
  );
}

export default App;