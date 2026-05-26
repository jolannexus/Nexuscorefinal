import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  DIGIFLAZZ_SECRET: z.string().default('development_secret'), // Provide default or make optional
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment variable validation failed:', _env.error.format());
  throw new Error('Missing or invalid environment variables');
}

export const env = _env.data;
