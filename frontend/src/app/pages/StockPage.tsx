import { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Package, AlertCircle } from 'lucide-react';

interface Produk {
  id_produk: number;
  brand: string;
  model: string;
  warna: string;
  kategori: string;
  stok: number;
  harga: number;
}

export default function StockPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Semua');

  // STATE DATA DARI DATABASE
  const [stockData, setStockData] = useState<Produk[]>([]);

  // AMBIL DATA DARI API
  useEffect(() => {
    axios
      .get(`https://admin-penjualan-handphone-z8wz.vercel.app/api/produk`)
      .then((response) => {
        setStockData(response.data);
      })
      .catch((error) => {
        console.error('Gagal mengambil data produk:', error);
      });
  }, []);

  const filteredStock = stockData.filter((item) => {
    const matchesSearch =
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === 'Semua' ||
      item.kategori === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const totalStok = stockData.reduce(
    (sum, item) => sum + item.stok,
    0
  );

  const lowStockCount = stockData.filter(
    (item) => item.stok < 10
  ).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Stok Handphone
        </h1>

        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Kelola dan pantau inventori handphone
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Total Stok
              </p>

              <p className="text-3xl font-bold text-gray-800">
                {totalStok}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Unit tersedia
              </p>
            </div>

            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Jenis Produk
              </p>

              <p className="text-3xl font-bold text-gray-800">
                {stockData.length}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Varian berbeda
              </p>
            </div>

            <div className="bg-green-500 p-3 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Stok Menipis
              </p>

              <p className="text-3xl font-bold text-red-600">
                {lowStockCount}
              </p>

              <p className="text-gray-400 text-xs mt-1">
                Perlu restock
              </p>
            </div>

            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                placeholder="Cari berdasarkan brand atau model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="Semua">
                Semua Kategori
              </option>

              <option value="Flagship">
                Flagship
              </option>

              <option value="Mid-range">
                Mid-range
              </option>

              <option value="Premium">
                Premium
              </option>

              <option value="Android">
                Android
              </option>

              <option value="iOS">
                iOS
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Brand
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Model
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Warna
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Kategori
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Stok
                </th>

                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                  Harga
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStock.map((item) => (
                <tr
                  key={item.id_produk}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-800">
                      {item.brand}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <p className="text-gray-700">
                      {item.model}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <p className="text-gray-600">
                      {item.warna}
                    </p>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.kategori === 'Flagship'
                          ? 'bg-purple-100 text-purple-700'
                          : item.kategori === 'Premium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {item.kategori}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.stok < 5
                          ? 'bg-red-100 text-red-700'
                          : item.stok < 10
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.stok} unit
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <p className="font-semibold text-gray-800">
                      Rp{' '}
                      {item.harga.toLocaleString('id-ID')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />

            <p>
              Tidak ada data yang sesuai dengan pencarian
            </p>
          </div>
        )}
      </div>
    </div>
  );
}