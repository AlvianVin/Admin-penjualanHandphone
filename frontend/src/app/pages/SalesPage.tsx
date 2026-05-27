import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Search
} from 'lucide-react';

interface SalesData {
  id_penjualan: number;
  tanggal: string;
  pembeli: string;
  harga: number;
  status: string;
  brand: string;
  produk: string;
}

export default function SalesPage() {

  const [salesData, setSalesData] =
    useState<SalesData[]>([]);

  const [search, setSearch] =
    useState('');

  /*
  =====================================
  AMBIL DATA REALTIME
  =====================================
  */

  useEffect(() => {

    const fetchSales = () => {

      axios
        .get(`https://backend-admin.vercel.app/api/penjualan`)
        .then((response) => {

          setSalesData(response.data);

        })
        .catch((error) => {

          console.error(
            'Gagal mengambil data penjualan:',
            error
          );

        });

    };

    // LOAD AWAL
    fetchSales();

    // AUTO REFRESH
    const interval = setInterval(() => {

      fetchSales();

    }, 2000);

    return () => clearInterval(interval);

  }, []);

  /*
  =====================================
  FILTER SEARCH
  =====================================
  */

  const filteredData =
    salesData.filter((item) => {

      const pembeli =
        (item.pembeli || '')
          .toLowerCase();

      const brand =
        (item.brand || '')
          .toLowerCase();

      const produk =
        (item.produk || '')
          .toLowerCase();

      const searchValue =
        search.toLowerCase();

      return (
        pembeli.includes(searchValue) ||
        brand.includes(searchValue) ||
        produk.includes(searchValue)
      );

    });

  /*
  =====================================
  STATISTIK
  =====================================
  */

  const totalPenjualan =
    salesData.length;

  const totalPendapatan =
    salesData.reduce(
      (sum, item) => sum + item.harga,
      0
    );

  const rataPenjualan =
    totalPenjualan > 0
      ? (
          totalPendapatan /
          totalPenjualan
        ).toFixed(0)
      : 0;

  const stats = [
    {
      title: 'Total Transaksi',
      value: totalPenjualan,
      subtitle: 'Penjualan',
      icon: ShoppingCart,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`,
      subtitle: 'Pendapatan',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Rata-rata Transaksi',
      value: `Rp ${Number(rataPenjualan).toLocaleString('id-ID')}`,
      subtitle: 'Per Penjualan',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="p-8">

      {/* HEADER */}
      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Data Penjualan
        </h1>

        <p className="text-gray-500 mt-1">
          Daftar transaksi penjualan handphone
        </p>

      </div>

      {/* CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {stats.map((stat, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >

            <div className="flex items-center justify-between mb-4">

              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>

            </div>

            <h3 className="text-gray-500 text-sm mb-1">
              {stat.title}
            </h3>

            <p className="text-2xl font-bold text-gray-800">
              {stat.value}
            </p>

            <p className="text-gray-400 text-xs mt-1">
              {stat.subtitle}
            </p>

          </div>

        ))}

      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">

        <div className="relative">

          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />

          <input
            type="text"
            placeholder="Cari pembeli atau produk..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none"
          />

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Riwayat Penjualan
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="border-b border-gray-200">

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Tanggal
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Produk
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Pembeli
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Harga
                </th>

                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredData.length > 0 ? (

                filteredData.map((sale) => (

                  <tr
                    key={sale.id_penjualan}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >

                    <td className="py-3 px-4 text-sm text-gray-600">

                      {new Date(
                        sale.tanggal
                      ).toLocaleDateString('id-ID')}

                    </td>

                    <td className="py-3 px-4 text-sm font-medium text-gray-800">

                      {sale.brand}
                      {' '}
                      {sale.produk}

                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {sale.pembeli}
                    </td>

                    <td className="py-3 px-4 text-sm font-semibold text-gray-800">

                      Rp
                      {' '}
                      {sale.harga.toLocaleString('id-ID')}

                    </td>

                    <td className="py-3 px-4">

                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {sale.status}
                      </span>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="text-center py-10 text-gray-500"
                  >

                    Data penjualan tidak ditemukan

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}