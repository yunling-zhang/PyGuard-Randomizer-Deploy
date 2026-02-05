import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../schemas/authSchema.js';

const router = express.Router();

// POST /api/auth/register - Register new user (with rate limiting)
router.post('/register', authLimiter, validate(registerSchema), register);

// POST /api/auth/login - Login user (with rate limiting)
router.post('/login', authLimiter, validate(loginSchema), login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

// GET /api/auth/me - Get current user
router.get('/me', getCurrentUser);

export default router;
