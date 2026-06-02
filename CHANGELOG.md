# Changelog

## [1.0.0-rc.1] - Pre-Production Release

### Security
- Migrasi password hashing dari SHA-256 ke bcrypt (cost factor 12)
- Proteksi endpoint /metrics dengan Bearer token authentication
- Rate limiting ketat pada semua auth routes (10x/15 menit, 20x/jam untuk login)
- Konfigurasi CORS production-ready dengan whitelist domain
- Hapus hardcoded Redis credential dan Supabase URL dari source code

### Added
- Forgot password flow dengan Redis token store (TTL 1 jam)
- Reset password route dengan validasi token
- Prisma seed script untuk inisialisasi Platform Admin
- Test suite dengan Vitest (auth, ledger, validation)
- Dockerfile multi-stage dengan distroless runner (non-root user 65532)

### Fixed
- Hapus hardcoded URL Supabase dari src/lib/env.ts
- Hapus default Redis credential dari Zod schema
- Ganti semua console.log/error/warn dengan structured Pino logger
- Auto-generated password untuk reseller baru menggunakan crypto.randomBytes
