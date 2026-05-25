# Production Deployment Strategy

NexusCore is designed for hyper-scale and multi-tenancy. For production, follow this architecture.

## 1. Tech Stack Requirements
- **Runtime**: Node.js 18+ (LTS)
- **Database**: Supabase / PostgreSQL (Managed)
- **Compute**: Vercel (Front) / Railway or Cloud Run (Backend)
- **Cache**: Redis / Upstash (Optional for high-speed balance checks)
- **CDN**: Cloudflare (Required for custom domain CNAME routing)

## 2. Environment Configuration
Declare these in your production host:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[INSTANCE].supabase.co:5432/postgres"

# Authentication (Firebase Admin)
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""

# Supplier Keys
DIGIFLAZZ_USERNAME=""
DIGIFLAZZ_API_KEY=""

# Security
JWT_SECRET="[LONG_RANDOM_STRING]"
ENCRYPTION_KEY="[32_CHAR_SECRET]" # For API Key storage
```

## 3. Production Deployment Steps

### Step 1: Database Migration
Deploy the Prisma schema to your production DB.
```bash
npx prisma migrate deploy
```

### Step 2: Build Application
Generate the optimized production bundle.
```bash
npm run build
```

### Step 3: Cloudflare Setup (Custom Domains)
1. Point your domain to Cloudflare.
2. Set SSL/TLS to "Full (Strict)".
3. Create a Wildcard A record `*` pointing to your server IP.
4. Enable "Cloudflare for SaaS" if using thousands of custom customer domains.

## 4. Scaling Recommendations
- **Immutable Ledger**: Ensure `Wallet` table has high IOPS. Ledger indexing is critical.
- **Worker Queues**: Move Supplier API calls to background workers (BullMQ) to prevent UI blocking.
- **Read Replicas**: For agencies with >100k resellers, use read replicas for reporting queries.

## 5. Security Checklist
- [ ] Ensure `DATABASE_URL` is not exposed to frontend.
- [ ] Rotate `ENCRYPTION_KEY` every 6 months.
- [ ] Implement Rate Limiting on `/api/orders`.
- [ ] Set up CSP (Content Security Policy) headers.
