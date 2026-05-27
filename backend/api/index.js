import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.get('/api/ping', (req, res) => {
  res.json({ status: 'express ok' });
});

export default serverless(app);