import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/applications';
import atsRoutes from './routes/ats';

dotenv.config();

const app       = express();
const PORT      = process.env.PORT      ?? 5000;
const MONGO_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/job-tracker';

// ── Rate limiter — auth routes only ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      5,                  // max 5 attempts per IP
  standardHeaders: true,        // sends RateLimit-* headers
  legacyHeaders:   false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authLimiter);     // rate limit applied here
app.use('/api/auth',         authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ats',          atsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Database + Server ─────────────────────────────────────────────────────────
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });