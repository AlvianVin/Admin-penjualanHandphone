import { useState } from 'react';
import { useNavigate } from 'react-router'; // Menggunakan react-router agar seragam dengan file lainnya
import axios from 'axios';

import {
  Smartphone,
  Lock,
  User
} from 'lucide-react';

export default function LoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        `https://admin-penjualan-handphone-z8wz.vercel.app/api/login`,
        {
          username,
          password
        }
      );

      if (response.data.success) {

        localStorage.setItem('isLoggedIn', 'true');

        localStorage.setItem(
          'adminName',
          response.data.admin.username
        );

        // Menggunakan window.location.href untuk memaksa sinkronisasi state browser secara instan
        window.location.href = '/dashboard';

      } else {

        alert('Username atau password salah');

      }

    } catch (error) {

      console.log(error);
      alert('Server error');

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">

        <div className="flex flex-col items-center mb-8">

          <div className="bg-indigo-600 p-4 rounded-full mb-4">
            <Smartphone className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Admin Portal
          </h1>

          <p className="text-gray-500 mt-2">
            Sistem Data Penjualan Handphone
          </p>

        </div>

        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>

            <div className="relative">

              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Masukkan username"
                required
              />

            </div>

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">

              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Masukkan password"
                required
              />

            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Masuk
          </button>

        </form>

      </div>

    </div>
  );

}