import { useEffect, useState } from 'react'; // 1. Tambahkan useState
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router';
import { Home, Package, ShoppingCart, Plus, LogOut, Smartphone, Menu, X } from 'lucide-react';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 2. Gunakan state agar React tahu kapan harus me-render ulang nama admin
  const [adminName, setAdminName] = useState('Admin');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Tutup sidebar otomatis saat navigasi di mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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

  // Item untuk bottom navigation di mobile (hanya 4 item utama agar muat)
  const bottomNavItems = [
    { path: '/dashboard', icon: Home, label: 'Home', end: true },
    { path: '/dashboard/stock', icon: Package, label: 'Stok' },
    { path: '/dashboard/sales', icon: ShoppingCart, label: 'Penjualan' },
    { path: '/dashboard/add-sale', icon: Plus, label: 'Tambah' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* BACKDROP OVERLAY - Hanya muncul di mobile saat sidebar terbuka */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-6 border-b border-indigo-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-700 p-2 rounded-lg">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold">PhoneSales</h2>
                <p className="text-xs text-indigo-300">Admin Panel</p>
              </div>
            </div>
            {/* Tombol close sidebar di mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-indigo-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
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

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR - Mobile header dengan hamburger */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm">PhoneSales</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0">
          <Outlet />
        </main>

        {/* BOTTOM NAVIGATION - Hanya di mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
          <div className="flex items-center justify-around py-2">
            {bottomNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${isActive
                    ? 'text-indigo-600'
                    : 'text-gray-400 hover:text-gray-600'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}