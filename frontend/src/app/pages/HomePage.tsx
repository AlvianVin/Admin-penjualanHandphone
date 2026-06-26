// src/pages/HomePage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp, DollarSign, Package, ShoppingBag } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  const [salesData, setSalesData] = useState<Penjualan[]>([]);
  const [stockData, setStockData] = useState<Produk[]>([]);

  /*
  =====================================
  AMBIL DATA REALTIME (SETIAP 2 DETIK)
  =====================================
  */
  useEffect(() => {
    const fetchData = () => {
      // 1. Hit API untuk Data Penjualan
      axios
        .get(`https://admin-penjualan-handphone-z8wz.vercel.app/api/penjualan`)
        .then((response) => {
          const hasilResponse = response.data;
          if (Array.isArray(hasilResponse)) {
            setSalesData(hasilResponse);
          } else if (hasilResponse && Array.isArray(hasilResponse.data)) {
            setSalesData(hasilResponse.data);
          } else {
            console.warn("Format data penjualan tidak dikenali:", hasilResponse);
          }
        })
        .catch((error) => {
          console.error("Gagal mengambil data penjualan:", error);
        });

      // 2. Hit API untuk Data Stok
      axios
        .get(`https://admin-penjualan-handphone-z8wz.vercel.app/api/produk`)
        .then((response) => {
          const hasilResponse = response.data;
          if (Array.isArray(hasilResponse)) {
            setStockData(hasilResponse);
          } else if (hasilResponse && Array.isArray(hasilResponse.data)) {
            setStockData(hasilResponse.data);
          } else {
            console.warn("Format data stok tidak dikenali:", hasilResponse);
          }
        })
        .catch((error) => {
          console.error("Gagal mengambil data stok:", error);
        });
    };

    // LOAD AWAL
    fetchData();

    // AUTO REFRESH - REALTIME SETIAP 2 DETIK
    const interval = setInterval(() => {
      fetchData();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Amankan variabel agar fungsi array (.reduce, .length, .forEach) tidak crash jika database kosong
  const dataPenjualanAman = Array.isArray(salesData) ? salesData : [];
  const dataStokAman = Array.isArray(stockData) ? stockData : [];

  /*
  =====================================
  STATISTIK (TETAP SESUAI ASLINYA)
  =====================================
  */
  const totalPenjualan = dataPenjualanAman.length;
  const totalPendapatan = dataPenjualanAman.reduce((sum, item) => sum + (Number(item.harga) || 0), 0);
  const totalStok = dataStokAman.reduce((sum, item) => sum + (Number(item.stok) || 0), 0);
  const rataPenjualan = totalPenjualan > 0 ? (totalPenjualan / 30).toFixed(1) : 0;

  /*
  =====================================
  DATA BULANAN (TETAP SESUAI ASLINYA)
  =====================================
  */
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
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
  dataPenjualanAman.forEach((sale) => {
    if (!sale.tanggal) return;
    const date = new Date(sale.tanggal);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (monthlyMap[key]) {
      monthlyMap[key].penjualan += 1;
    }
  });

  const monthlySalesData = Object.values(monthlyMap);

  /*
  =====================================
  TOP BRAND (TETAP SESUAI ASLINYA)
  =====================================
  */
  const brandMap: any = {};
  dataPenjualanAman.forEach((sale) => {
    if (sale.brand) {
      if (!brandMap[sale.brand]) {
        brandMap[sale.brand] = 0;
      }
      brandMap[sale.brand]++;
    }
  });

  const topSalesData = Object.entries(brandMap).map(([brand, jumlah]) => ({
    brand,
    jumlah,
  }));

  /*
  =====================================
  CARD STATS (TETAP SESUAI ASLINYA)
  =====================================
  */
  const stats = [
    {
      title: "Total Penjualan",
      value: totalPenjualan,
      subtitle: "Unit",
      icon: ShoppingBag,
      color: "bg-blue-500",
      trend: "+12%",
    },
    {
      title: "Total Pendapatan",
      value: `Rp ${(totalPendapatan / 1000000).toFixed(1)} Jt`,
      subtitle: "Total",
      icon: DollarSign,
      color: "bg-green-500",
      trend: "+8%",
    },
    {
      title: "Stok Tersedia",
      value: totalStok,
      subtitle: "Unit",
      icon: Package,
      color: "bg-orange-500",
      trend: "-5%",
    },
    {
      title: "Rata-rata Penjualan/Hari",
      value: rataPenjualan,
      subtitle: "Unit",
      icon: TrendingUp,
      color: "bg-purple-500",
      trend: "+15%",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Statistik Penjualan Handphone</p>
      </div>

      {/* CARD */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`${stat.color} p-2 sm:p-3 rounded-lg`}>
                <stat.icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${stat.trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{stat.trend}</span>
            </div>
            <h3 className="text-gray-500 text-xs sm:text-sm mb-1 truncate">{stat.title}</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{stat.value}</p>
            <p className="text-gray-400 text-[10px] sm:text-xs mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 lg:mb-8">
        {/* LINE CHART (PENJUALAN BULANAN) */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Penjualan Bulanan</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" stroke="#6b7280" />
              {/* Domain diarahkan ke dataMax agar tinggi grafik pas mengikuti data tertinggi */}
              <YAxis stroke="#6b7280" domain={[0, "dataMax"]} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="penjualan" stroke="#6366f1" strokeWidth={2} name="Unit Terjual" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR CHART (TOP BRAND TERLARIS) */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
          <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Top Brand Terlaris</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topSalesData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="brand" stroke="#6b7280" />
              {/* Domain diarahkan ke dataMax agar tinggi grafik pas mengikuti data tertinggi */}
              <YAxis stroke="#6b7280" domain={[0, "dataMax"]} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="jumlah" fill="#6366f1" name="Unit Terjual" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-100">
        <h2 className="text-base sm:text-xl font-bold text-gray-800 mb-4">Penjualan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600">Tanggal</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600">Produk</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600">Pembeli</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600">Harga</th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataPenjualanAman.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400 text-sm">
                    Tidak ada data penjualan terbaru.
                  </td>
                </tr>
              ) : (
                dataPenjualanAman.map((sale) => (
                  <tr key={sale.id_penjualan} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{sale.tanggal ? new Date(sale.tanggal).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-gray-800">
                      {sale.brand} {sale.produk}
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600">{sale.pembeli}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-gray-800 whitespace-nowrap">Rp {(sale.harga || 0).toLocaleString("id-ID")}</td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium rounded-full">{sale.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
