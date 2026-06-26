import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddStockPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    warna: '',
    kategori: 'Android',
    stok: '',
    harga: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLSelectElement
    >
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      await axios.post(
        `https://admin-penjualan-handphone-z8wz.vercel.app/api/produk`,
        {
          brand: formData.brand,
          model: formData.model,
          warna: formData.warna,
          kategori: formData.kategori,
          stok: Number(formData.stok),
          harga: Number(formData.harga),
        }
      );

      toast.success(
        'Produk berhasil ditambahkan'
      );

      setTimeout(() => {

        navigate('/dashboard/stock');

      }, 1500);

    } catch (error) {

      console.log(error);

      toast.error(
        'Gagal menambahkan produk'
      );

    }

  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      <div className="mb-6 lg:mb-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Tambah Stok HP
        </h1>

        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Tambahkan produk handphone baru
        </p>

      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* BRAND */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>

            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              required
            />

          </div>

          {/* MODEL */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model HP
            </label>

            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              required
            />

          </div>

          {/* WARNA */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warna
            </label>

            <input
              type="text"
              name="warna"
              value={formData.warna}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              required
            />

          </div>

          {/* KATEGORI */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>

            <select
              name="kategori"
              value={formData.kategori}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
            >

              <option value="Android">
                Android
              </option>

              <option value="iOS">
                iOS
              </option>

            </select>

          </div>

          {/* STOK */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Stok
            </label>

            <input
              type="number"
              name="stok"
              value={formData.stok}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              required
            />

          </div>

          {/* HARGA */}
          <div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga
            </label>

            <input
              type="number"
              name="harga"
              value={formData.harga}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none"
              required
            />

          </div>

          {/* BUTTON */}
          <div className="flex gap-4 pt-4">

            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >

              <PackagePlus className="w-5 h-5" />

              Tambah Produk

            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/dashboard/stock')
              }
              className="px-6 py-3 border border-gray-300 rounded-lg"
            >
              Batal
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}