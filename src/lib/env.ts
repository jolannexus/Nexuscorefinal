import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

function cleanDatabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  let cleaned = url;
  
  // Strip and URL-encode bracketed passwords automatically
  if (cleaned.includes('[') && cleaned.includes(']')) {
    cleaned = cleaned.replace(/\[(.*?)\]/, (_, p1) => encodeURIComponent(p1));
  }
  
  return cleaned;
}

// DATABASE_URL harus dikonfigurasi melalui file .env
// Ensure connection parameters are sanitized and cleaned before they are validated
process.env.DATABASE_URL = cleanDatabaseUrl(process.env.DATABASE_URL);
if (process.env.DIRECT_URL) {
  process.env.DIRECT_URL = cleanDatabaseUrl(process.env.DIRECT_URL);
}

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

if (!process.env.DATABASE_URL) {
  throw new Error('[ENV] DATABASE_URL wajib diset. Salin .env.example ke .env dan isi nilainya.\nFormat: postgresql://user:password@host:port/dbname');
}

import crypto from 'crypto';

// ⚠️  Semua variable wajib diset di file .env
// Salin .env.example ke .env lalu isi sesuai environment kamu
// Untuk Supabase: gunakan port 6543 (pooler) untuk DATABASE_URL
//                 gunakan port 5432 untuk DIRECT_URL (migrations)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  DIGIFLAZZ_SECRET: z.string().default(process.env.NODE_ENV === 'production' ? crypto.randomBytes(32).toString('hex') : 'development_secret'), 
  GEMINI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().default('redis://localhost:6379/0'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Environment variable validation failed:', _env.error.format());
  throw new Error('Missing or invalid environment variables');
}

export const env = _env.data;
