import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Produk {
  id_produk: number;
  brand: string;
  model: string;
  harga: number;
}

export default function AddSalePage() {
  const navigate = useNavigate();

  const [availableProducts, setAvailableProducts] = useState<Produk[]>([]);

  const [formData, setFormData] = useState({
    id_produk: 0,
    produk: '',
    pembeli: '',
    nomorTelepon: '',
    alamat: '',
    metode: 'Transfer',
  });

  // AMBIL PRODUK DARI DATABASE
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/produk`)
      .then((response) => {
        setAvailableProducts(response.data);
      })
      .catch((error) => {
        console.error('Gagal mengambil produk:', error);
      });
  }, []);

  // PRODUK TERPILIH
  const selectedProduct = availableProducts.find(
    (p) =>
      `${p.brand} ${p.model}` === formData.produk
  );

  // HANDLE INPUT BIASA
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SIMPAN TRANSAKSI
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!selectedProduct) {
      toast.error('Pilih produk terlebih dahulu');
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/penjualan`,
        {
          id_produk: formData.id_produk,
          pembeli: formData.pembeli,
          metode: formData.metode,
          total_harga: selectedProduct.harga,
        }
      );

      toast.success(
        'Transaksi berhasil ditambahkan!'
      );

      setTimeout(() => {
        navigate('/dashboard/sales');
      }, 1500);

    } catch (error: any) {
      console.error(error);

      console.log(error.response?.data);

      toast.error(
        error.response?.data?.message ||
        'Gagal menyimpan transaksi'
      );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Tambah Penjualan
        </h1>

        <p className="text-gray-500 mt-1">
          Input data transaksi penjualan baru
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="space-y-6">

              {/* PILIH PRODUK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Produk *
                </label>

                <select
                  value={formData.produk}
                  onChange={(e) => {

                    const selected =
                      availableProducts.find(
                        (p) =>
                          `${p.brand} ${p.model}` ===
                          e.target.value
                      );

                    setFormData({
                      ...formData,
                      produk: e.target.value,
                      id_produk: selected
                        ? selected.id_produk
                        : 0,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">
                    -- Pilih Handphone --
                  </option>

                  {availableProducts.map((product) => (
                    <option
                      key={product.id_produk}
                      value={`${product.brand} ${product.model}`}
                    >
                      {product.brand} {product.model}
                      {' - '}
                      Rp {product.harga.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              {/* NAMA + TELP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pembeli *
                  </label>

                  <input
                    type="text"
                    name="pembeli"
                    value={formData.pembeli}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="Masukkan nama pembeli"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon *
                  </label>

                  <input
                    type="tel"
                    name="nomorTelepon"
                    value={formData.nomorTelepon}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="08xxxxxxxxxx"
                    required
                  />
                </div>

              </div>

              {/* ALAMAT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Pembeli *
                </label>

                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none"
                  placeholder="Masukkan alamat lengkap pembeli"
                  required
                />
              </div>

              {/* METODE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metode Pembayaran *
                </label>

                <div className="grid grid-cols-3 gap-4">

                  {[
                    'Transfer',
                    'Cash',
                    'Kartu Kredit',
                  ].map((metode) => (

                    <label
                      key={metode}
                      className={`flex items-center justify-center px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.metode === metode
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-gray-300 hover:border-indigo-300'
                      }`}
                    >

                      <input
                        type="radio"
                        name="metode"
                        value={metode}
                        checked={
                          formData.metode === metode
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            metode: e.target.value,
                          })
                        }
                        className="sr-only"
                      />

                      <span className="font-medium">
                        {metode}
                      </span>

                    </label>
                  ))}
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex gap-4 pt-4">

                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Simpan Transaksi
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/dashboard/sales')
                  }
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>

              </div>

            </div>
          </form>
        </div>

        {/* RINGKASAN */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">

              <div className="bg-indigo-100 p-2 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-indigo-600" />
              </div>

              <h3 className="font-semibold text-gray-800">
                Ringkasan Transaksi
              </h3>

            </div>

            {selectedProduct ? (

              <div className="space-y-4">

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Produk
                  </p>

                  <p className="font-semibold text-gray-800">
                    {selectedProduct.brand}
                    {' '}
                    {selectedProduct.model}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Pembeli
                  </p>

                  <p className="font-medium text-gray-800">
                    {formData.pembeli || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Metode Pembayaran
                  </p>

                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {formData.metode}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">

                  <p className="text-sm text-gray-500 mb-2">
                    Total Pembayaran
                  </p>

                  <p className="text-2xl font-bold text-indigo-600">
                    Rp{' '}
                    {selectedProduct.harga.toLocaleString(
                      'id-ID'
                    )}
                  </p>

                </div>

              </div>

            ) : (

              <div className="text-center py-8">

                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />

                <p className="text-gray-500 text-sm">
                  Pilih produk untuk melihat ringkasan
                </p>

              </div>

            )}
          </div>
        </div>

      </div>
    </div>
  );
}