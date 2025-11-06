import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateMap } from './routes/generateMap';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Inagiffy API is running' });
});

// API Routes
app.post('/api/generate-map', generateMap);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

