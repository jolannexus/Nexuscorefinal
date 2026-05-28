import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Sanitize and normalize REDIS_URL to protect against malformed values like "://localhost:6379"
if (process.env.REDIS_URL) {
  let url = process.env.REDIS_URL.trim();
  if (url.startsWith('://')) {
    url = 'redis' + url;
  } else if (!url.includes('://') && !url.startsWith('/')) {
    url = 'redis://' + url;
  }
  process.env.REDIS_URL = url;
}

// Gracefully supply default connection parameters if not set to prevent initial server crash
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/nexuscore?schema=public&sslmode=prefer';
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  DIGIFLAZZ_SECRET: z.string().default('development_secret'), // Provide default or make optional
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default('redis://default:JR9VPQOrk06IftUHAVl6O6ZUNfco98Vk@futuristic-immaculate-citrine-52124.db.redis.io:15097').transform(val => {
    const fallback = 'redis://default:JR9VPQOrk06IftUHAVl6O6ZUNfco98Vk@futuristic-immaculate-citrine-52124.db.redis.io:15097';
    if (!val || val.trim() === '' || val.includes('localhost') || val.includes('127.0.0.1')) {
      return fallback;
    }
    return val;
  }),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment variable validation failed:', _env.error.format());
  throw new Error('Missing or invalid environment variables');
}

export const env = _env.data;
