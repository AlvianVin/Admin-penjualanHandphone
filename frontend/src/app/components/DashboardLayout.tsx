import { useEffect, useState } from 'react'; // 1. Tambahkan useState
import { Outlet, useNavigate, NavLink } from 'react-router';
import { Home, Package, ShoppingCart, Plus, LogOut, Smartphone } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  
  // 2. Gunakan state agar React tahu kapan harus me-render ulang nama admin
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      navigate('/');
    } else {
      // 3. Ambil nama admin secara dinamis begitu komponen aktif
      const storedName = localStorage.getItem('adminName');
      if (storedName) setAdminName(storedName);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminName');
    navigate('/');
  };

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', end: true },
    { path: '/dashboard/stock', icon: Package, label: 'Stok HP' },
    { path: '/dashboard/sales', icon: ShoppingCart, label: 'Data Penjualan' },
    { path: '/dashboard/add-sale', icon: Plus, label: 'Tambah Penjualan' },
    { path: '/dashboard/add-stock', icon: Package, label: 'Tambah Stok HP' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-700 p-2 rounded-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold">PhoneSales</h2>
              <p className="text-xs text-indigo-300">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-indigo-800">
          <div className="flex items-center justify-between mb-3 px-4 py-2 bg-indigo-800 rounded-lg">
            <div>
              {/* Nama Admin sekarang akan langsung muncul secara dinamis */}
              <p className="text-sm font-medium">{adminName}</p> 
              <p className="text-xs text-indigo-300">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:bg-indigo-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}