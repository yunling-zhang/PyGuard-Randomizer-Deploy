import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import crypto from 'crypto';
import teamRoutes from './routes/teams.js';
import authRoutes from './routes/auth.js';
import logger, { requestLogger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Generate a secure session secret if not provided
const getSessionSecret = () => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  // In development, generate a random secret (will change on restart)
  if (process.env.NODE_ENV !== 'production') {
    const generatedSecret = crypto.randomBytes(32).toString('hex');
    logger.warn('SESSION_SECRET not set. Generated temporary secret for development.');
    return generatedSecret;
  }
  // In production, require SESSION_SECRET to be set
  logger.error('SESSION_SECRET must be set in production environment');
  process.exit(1);
};

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Request logging
app.use(requestLogger);

// Global rate limiting (disabled in development)
if (process.env.NODE_ENV !== 'development') {
  app.use('/api', apiLimiter);
}

// Session configuration
app.use(session({
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  // Don't expose internal errors in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(err.status || 500).json({
    error: 'Server Error',
    message
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
