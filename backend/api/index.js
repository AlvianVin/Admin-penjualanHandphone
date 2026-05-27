import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import serverless from 'serverless-http';

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// KONEKSI DATABASE
// ============================================

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000
});

// ============================================
// TEST
// ============================================

app.get('/', (req, res) => {
  res.send('Backend berjalan');
});

// ============================================
// LOGIN
// ============================================

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const sql = `SELECT * FROM admin WHERE username = ? AND password = ?`;

  db.query(sql, [username, password], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.length > 0) {
      res.json({ success: true, admin: result[0] });
    } else {
      res.json({ success: false, message: 'Username atau password salah' });
    }
  });
});

// ============================================
// PRODUK
// ============================================

app.get('/api/produk', (req, res) => {
  db.query(`SELECT * FROM produk ORDER BY id_produk DESC`, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/produk', (req, res) => {
  const { brand, model, warna, kategori, stok, harga } = req.body;

  db.query(
    `INSERT INTO produk (brand, model, warna, kategori, stok, harga) VALUES (?, ?, ?, ?, ?, ?)`,
    [brand, model, warna, kategori, stok, harga],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, message: 'Produk berhasil ditambahkan' });
    }
  );
});

// ============================================
// PENJUALAN
// ============================================

app.get('/api/penjualan', (req, res) => {
  const sql = `
    SELECT
      penjualan.id_penjualan,
      penjualan.tanggal,
      penjualan.pembeli,
      penjualan.total_harga AS harga,
      penjualan.status,
      produk.brand,
      produk.model AS produk
    FROM penjualan
    JOIN detail_penjualan ON penjualan.id_penjualan = detail_penjualan.id_penjualan
    JOIN produk ON detail_penjualan.id_produk = produk.id_produk
    ORDER BY penjualan.id_penjualan DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

app.post('/api/penjualan', (req, res) => {
  const { id_produk, pembeli, metode, total_harga } = req.body;

  if (!id_produk) return res.status(400).json({ message: 'Produk belum dipilih' });

  db.query(`SELECT * FROM produk WHERE id_produk = ?`, [id_produk], (errProduk, produkResult) => {
    if (errProduk) return res.status(500).json(errProduk);
    if (produkResult.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const produk = produkResult[0];

    if (produk.stok <= 0) return res.status(400).json({ message: 'Stok habis' });

    const invoice = `INV-${Date.now()}`;
    const tanggal = new Date();
    const status = 'Selesai';

    db.query(
      `INSERT INTO penjualan (invoice, tanggal, pembeli, metode_pembayaran, total_harga, status, id_admin) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [invoice, tanggal, pembeli, metode, total_harga, status, 3],
      (errPenjualan, resultPenjualan) => {
        if (errPenjualan) return res.status(500).json(errPenjualan);

        const id_penjualan = resultPenjualan.insertId;

        db.query(
          `INSERT INTO detail_penjualan (id_penjualan, id_produk, jumlah, harga_satuan, subtotal) VALUES (?, ?, ?, ?, ?)`,
          [id_penjualan, id_produk, 1, produk.harga, produk.harga],
          (errDetail) => {
            if (errDetail) return res.status(500).json(errDetail);

            db.query(
              `UPDATE produk SET stok = stok - 1 WHERE id_produk = ?`,
              [id_produk],
              (errUpdate) => {
                if (errUpdate) return res.status(500).json(errUpdate);
                res.json({ success: true, message: 'Transaksi berhasil disimpan' });
              }
            );
          }
        );
      }
    );
  });
});

// ============================================
// DETAIL PENJUALAN
// ============================================

app.get('/api/detail-penjualan', (req, res) => {  // fix: hapus double slash
  db.query(`SELECT * FROM detail_penjualan ORDER BY id_detail DESC`, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// ============================================
// EXPORT SERVERLESS
// ============================================

export default serverless(app);  // satu kali saja, tidak ada app.listen