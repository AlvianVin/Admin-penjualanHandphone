import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/*
=====================================
KONEKSI DATABASE
=====================================
*/

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


/*
=====================================
TEST SERVER
=====================================
*/

app.get('/', (req, res) => {
  res.send('Backend berjalan');
});

/*
=====================================
LOGIN
=====================================
*/

app.post('/login', (req, res) => {

  const { username, password } = req.body;

  const sql = `
    SELECT * FROM admin
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, password], (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json(err);

    }

    if (result.length > 0) {

      res.json({
        success: true,
        admin: result[0]
      });

    } else {

      res.json({
        success: false,
        message: 'Username atau password salah'
      });

    }

  });

});

/*
=====================================
AMBIL SEMUA PRODUK
=====================================
*/

app.get('/produk', (req, res) => {

  const sql = `
    SELECT * FROM produk
    ORDER BY id_produk DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json(err);

    }

    res.json(result);

  });

});

/*
=====================================
TAMBAH PRODUK
=====================================
*/

app.post('/produk', (req, res) => {

  const {
    brand,
    model,
    warna,
    kategori,
    stok,
    harga
  } = req.body;

  const sql = `
    INSERT INTO produk
    (
      brand,
      model,
      warna,
      kategori,
      stok,
      harga
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      brand,
      model,
      warna,
      kategori,
      stok,
      harga
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

      res.json({
        success: true,
        message: 'Produk berhasil ditambahkan'
      });

    }
  );

});

/*
=====================================
AMBIL SEMUA PENJUALAN
=====================================
*/

app.get('/penjualan', (req, res) => {

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

    JOIN detail_penjualan
      ON penjualan.id_penjualan =
         detail_penjualan.id_penjualan

    JOIN produk
      ON detail_penjualan.id_produk =
         produk.id_produk

    ORDER BY penjualan.id_penjualan DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json(err);

    }

    res.json(result);

  });

});

/*
=====================================
TAMBAH PENJUALAN
=====================================
*/

app.post('/penjualan', (req, res) => {

  console.log(req.body);

  const {
    id_produk,
    pembeli,
    metode,
    total_harga
  } = req.body;

  // VALIDASI
  if (!id_produk) {

    return res.status(400).json({
      message: 'Produk belum dipilih'
    });

  }

  /*
  =====================================
  CEK PRODUK
  =====================================
  */

  db.query(
    `
    SELECT * FROM produk
    WHERE id_produk = ?
    `,
    [id_produk],
    (errProduk, produkResult) => {

      if (errProduk) {

        console.log(errProduk);

        return res.status(500).json(errProduk);

      }

      if (produkResult.length === 0) {

        return res.status(404).json({
          message: 'Produk tidak ditemukan'
        });

      }

      const produk = produkResult[0];

      /*
      =====================================
      CEK STOK
      =====================================
      */

      if (produk.stok <= 0) {

        return res.status(400).json({
          message: 'Stok habis'
        });

      }

      const invoice =
        `INV-${Date.now()}`;

      const tanggal =
        new Date();

      const status =
        'Selesai';

      /*
      =====================================
      INSERT PENJUALAN
      =====================================
      */

      const sqlPenjualan = `
        INSERT INTO penjualan
        (
          invoice,
          tanggal,
          pembeli,
          metode_pembayaran,
          total_harga,
          status,
          id_admin
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        sqlPenjualan,
        [
          invoice,
          tanggal,
          pembeli,
          metode,
          total_harga,
          status,
          3
        ],
        (errPenjualan, resultPenjualan) => {

          if (errPenjualan) {

            console.log(errPenjualan);

            return res.status(500).json(errPenjualan);

          }

          const id_penjualan =
            resultPenjualan.insertId;

          /*
          =====================================
          INSERT DETAIL PENJUALAN
          =====================================
          */

          const sqlDetail = `
            INSERT INTO detail_penjualan
            (
              id_penjualan,
              id_produk,
              jumlah,
              harga_satuan,
              subtotal
            )
            VALUES (?, ?, ?, ?, ?)
          `;

          db.query(
            sqlDetail,
            [
              id_penjualan,
              id_produk,
              1,
              produk.harga,
              produk.harga
            ],
            (errDetail) => {

              if (errDetail) {

                console.log(errDetail);

                return res.status(500).json(errDetail);

              }

              /*
              =====================================
              UPDATE STOK
              =====================================
              */

              const sqlUpdateStok = `
                UPDATE produk
                SET stok = stok - 1
                WHERE id_produk = ?
              `;

              db.query(
                sqlUpdateStok,
                [id_produk],
                (errUpdate) => {

                  if (errUpdate) {

                    console.log(errUpdate);

                    return res.status(500).json(errUpdate);

                  }

                  res.json({
                    success: true,
                    message:
                      'Transaksi berhasil disimpan'
                  });

                }
              );

            }
          );

        }
      );

    }
  );

});

/*
=====================================
AMBIL DETAIL PENJUALAN
=====================================
*/

app.get('/detail-penjualan', (req, res) => {

  const sql = `
    SELECT * FROM detail_penjualan
    ORDER BY id_detail DESC
  `;

  db.query(sql, (err, result) => {

    if (err) {

      console.log(err);

      return res.status(500).json(err);

    }

    res.json(result);

  });

});

/*
=====================================
JALANKAN SERVER
=====================================
*/
import serverless from 'serverless-http';

export default serverless(app);