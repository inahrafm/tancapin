import React, { useState, useEffect } from 'react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const USER_SERVICE_URL = 'http://localhost:8002'; // URL dasar untuk User Service Anda

  // Fungsi untuk mengambil daftar pengguna dari backend
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('access_token'); // Ambil token dari localStorage
        if (!token) {
          throw new Error("Autentikasi diperlukan. Silakan login kembali.");
        }

        const response = await fetch(`${USER_SERVICE_URL}/users`, {
          method: 'GET', // Metode GET untuk mengambil data
          headers: {
            'Authorization': `Bearer ${token}`, // Sertakan token JWT di header
          },
        });

        if (!response.ok) {
          let errorMsg = `Gagal memuat daftar pengguna: HTTP error! status: ${response.status}`;
          if (response.status === 401) {
            errorMsg = "Sesi kadaluwarsa atau tidak valid. Silakan login kembali.";
            // Opsional: hapus token dari localStorage dan picu logout jika ini terjadi
            // localStorage.removeItem('access_token');
            // window.location.reload();
          } else {
            try {
              const errorData = await response.json();
              errorMsg = errorData.detail || errorMsg;
            } catch (parseError) {
              // Jika respons bukan JSON, gunakan pesan error default
            }
          }
          throw new Error(errorMsg);
        }

        const data = await response.json();
        setUsers(data);
      } catch (e) {
        setError("Error memuat daftar pengguna: " + e.message);
        console.error("Error fetching users:", e);
        setUsers([]); // Kosongkan data jika ada error
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // Opsional: Refresh daftar user secara berkala
    // const interval = setInterval(fetchUsers, 60000); // Setiap 60 detik
    // return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
        Memuat daftar pengguna...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Pengguna</h2>

      {users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                  ID
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                  Email
                </th>
                {/* Opsi: Tambahkan kolom untuk Peran jika ada */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.id}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {user.username}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    {/* Placeholder untuk email, jika kolom email tidak ada di backend, ini akan kosong */}
                    {user.email || '-'}
                  </td>
                  {/* Opsi: Tambahkan kolom Peran jika ada */}
                  {/* <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-700">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {user.role || 'N/A'}
                    </span>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-center">Tidak ada pengguna yang terdaftar.</p>
      )}
    </div>
  );
};

export default UserManagementPage;