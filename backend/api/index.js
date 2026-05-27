import express from 'express';

const app = express();

app.get('/api/ping', (req, res) => {
  res.json({ status: 'express only' });
});

export default async function handler(req, res) {
  return new Promise((resolve) => {
    app(req, res);
    resolve();
  });
}