import { z } from 'zod';

// Schema for user registration
export const registerSchema = z.object({
  body: z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .trim(),
    password: z.string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

// Schema for user login
export const loginSchema = z.object({
  body: z.object({
    username: z.string()
      .min(1, 'Username is required')
      .trim(),
    password: z.string()
      .min(1, 'Password is required'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
