// src/pages/HomePage.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag
} from 'lucide-react';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Penjualan {
  id_penjualan: number;
  tanggal: string;
  pembeli: string;
  harga: number;
  status: string;
  brand: string;
  produk: string;
}

interface Produk {
  id_produk: number;
  stok: number;
}

export default function HomePage() {

  const [salesData, setSalesData] =
    useState<Penjualan[]>([]);

  const [stockData, setStockData] =
    useState<Produk[]>([]);

  /*
  =====================================
  AMBIL DATA REALTIME
  =====================================
  */

  useEffect(() => {

    const fetchData = () => {

      axios
        .get('http://localhost:3000/penjualan')
        .then((response) => {
          setSalesData(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

      axios
        .get('http://localhost:3000/produk')
        .then((response) => {
          setStockData(response.data);
        })
        .catch((error) => {
          console.log(error);
        });

    };

    // LOAD AWAL
    fetchData();

    // AUTO REFRESH
    const interval = setInterval(() => {

      fetchData();

    }, 2000);

    return () => clearInterval(interval);

  }, []);

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

  const totalStok =
    stockData.reduce(
      (sum, item) => sum + item.stok,
      0
    );

  const rataPenjualan =
    totalPenjualan > 0
      ? (
          totalPenjualan / 30
        ).toFixed(1)
      : 0;

  /*
  =====================================
  DATA BULANAN
  =====================================
  */

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  const monthlyMap: any = {};

  // BUAT 6 BULAN TERAKHIR
  for (let i = 5; i >= 0; i--) {

    const date = new Date();

    date.setMonth(date.getMonth() - i);

    const month = date.getMonth();

    const year = date.getFullYear();

    const key = `${year}-${month}`;

    monthlyMap[key] = {
      key,
      bulan: `${monthNames[month]} ${year}`,
      penjualan: 0,
    };

  }

  // ISI DATA DARI DATABASE
  salesData.forEach((sale) => {

    const date = new Date(sale.tanggal);

    const month = date.getMonth();

    const year = date.getFullYear();

    const key = `${year}-${month}`;

    if (monthlyMap[key]) {

      monthlyMap[key].penjualan += 1;

    }

  });

  const monthlySalesData =
    Object.values(monthlyMap);

  /*
  =====================================
  TOP BRAND
  =====================================
  */

  const brandMap: any = {};

  salesData.forEach((sale) => {

    if (!brandMap[sale.brand]) {
      brandMap[sale.brand] = 0;
    }

    brandMap[sale.brand]++;

  });

  const topSalesData =
    Object.entries(brandMap).map(
      ([brand, jumlah]) => ({
        brand,
        jumlah,
      })
    );

  /*
  =====================================
  CARD STATS
  =====================================
  */

  const stats = [
    {
      title: 'Total Penjualan',
      value: totalPenjualan,
      subtitle: 'Unit',
      icon: ShoppingBag,
      color: 'bg-blue-500',
      trend: '+12%',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${(totalPendapatan / 1000000).toFixed(1)} Jt`,
      subtitle: 'Total',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+8%',
    },
    {
      title: 'Stok Tersedia',
      value: totalStok,
      subtitle: 'Unit',
      icon: Package,
      color: 'bg-orange-500',
      trend: '-5%',
    },
    {
      title: 'Rata-rata Penjualan/Hari',
      value: rataPenjualan,
      subtitle: 'Unit',
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: '+15%',
    },
  ];

  return (
    <div className="p-8">

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Statistik Penjualan Handphone
        </p>

      </div>

      {/* CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        {stats.map((stat, index) => (

          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >

            <div className="flex items-center justify-between mb-4">

              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>

              <span
                className={`text-sm font-semibold ${
                  stat.trend.startsWith('+')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.trend}
              </span>

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

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* LINE */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Penjualan Bulanan
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={monthlySalesData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="bulan"
                stroke="#6b7280"
              />

              <YAxis
                stroke="#6b7280"
                domain={[0, 100]}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="penjualan"
                stroke="#6366f1"
                strokeWidth={2}
                name="Unit Terjual"
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        {/* BAR */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Top Brand Terlaris
          </h2>

          <ResponsiveContainer width="100%" height={300}>

            <BarChart
              data={topSalesData}
              barCategoryGap="30%"
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />

              <XAxis
                dataKey="brand"
                stroke="#6b7280"
              />

              <YAxis
                stroke="#6b7280"
                domain={[0, 100]}
              />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="jumlah"
                fill="#6366f1"
                name="Unit Terjual"
                barSize={40}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">

        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Penjualan Terbaru
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

              {salesData.map((sale) => (

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

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}