import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// HELPER DB (Supabase PostgreSQL)
// ============================================

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ============================================
// PING
// ============================================

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' });
});

// ============================================
// LOGIN
// ============================================

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM admin WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, admin: result.rows[0] });
    } else {
      res.json({ success: false, message: 'Username atau password salah' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ============================================
// PRODUK
// ============================================

app.get('/api/produk', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produk ORDER BY id_produk DESC');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.post('/api/produk', async (req, res) => {
  try {
    const { brand, model, warna, kategori, stok, harga } = req.body;
    await pool.query(
      'INSERT INTO produk (brand, model, warna, kategori, stok, harga) VALUES ($1, $2, $3, $4, $5, $6)',
      [brand, model, warna, kategori, stok, harga]
    );
    res.json({ success: true, message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ============================================
// PENJUALAN
// ============================================

app.get('/api/penjualan', async (req, res) => {
  try {
    const sql = `
      SELECT penjualan.id_penjualan, penjualan.tanggal, penjualan.pembeli,
             penjualan.total_harga AS harga, penjualan.status,
             produk.brand, produk.model AS produk
      FROM penjualan
      JOIN detail_penjualan ON penjualan.id_penjualan = detail_penjualan.id_penjualan
      JOIN produk ON detail_penjualan.id_produk = produk.id_produk
      ORDER BY penjualan.id_penjualan DESC
    `;
    const result = await pool.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

app.post('/api/penjualan', async (req, res) => {
  const client = await pool.connect();

  try {
    const { id_produk, pembeli, metode, total_harga } = req.body;
    if (!id_produk) return res.status(400).json({ message: 'Produk belum dipilih' });

    const produkResult = await client.query(
      'SELECT * FROM produk WHERE id_produk = $1', [id_produk]
    );
    if (produkResult.rows.length === 0) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const produk = produkResult.rows[0];
    if (produk.stok <= 0) return res.status(400).json({ message: 'Stok habis' });

    const invoice = `INV-${Date.now()}`;
    const tanggal = new Date();
    const status = 'Selesai';

    await client.query('BEGIN');

    const penjualanResult = await client.query(
      `INSERT INTO penjualan (invoice, tanggal, pembeli, metode_pembayaran, total_harga, status, id_admin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_penjualan`,
      [invoice, tanggal, pembeli, metode, total_harga, status, 3]
    );

    const id_penjualan = penjualanResult.rows[0].id_penjualan;

    await client.query(
      `INSERT INTO detail_penjualan (id_penjualan, id_produk, jumlah, harga_satuan, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [id_penjualan, id_produk, 1, produk.harga, produk.harga]
    );

    await client.query(
      'UPDATE produk SET stok = stok - 1 WHERE id_produk = $1',
      [id_produk]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Transaksi berhasil disimpan' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.log(err);
    res.status(500).json(err);
  } finally {
    client.release();
  }
});

// ============================================
// DETAIL PENJUALAN
// ============================================

app.get('/api/detail-penjualan', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM detail_penjualan ORDER BY id_detail DESC');
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// ============================================
// HANDLER — tanpa serverless-http
// ============================================

export default async function handler(req, res) {
  return new Promise((resolve) => {
    app(req, res);
    resolve();
  });
}
