import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateMap } from './routes/generateMap';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inagiffy API is running' });
});

app.post('/api/generate-map', generateMap);

app.listen(PORT, () => {
  console.log(`Inagiffy API server is running`);
  console.log(`Listening on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

