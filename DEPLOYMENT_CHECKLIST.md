# Deployment Readiness Audit & Infrastructure Checklist

## 1. Environment Variables Checklist
Before activating any production deployment (Render, Railway, Kubernetes), ensure the following strictly required variables are set securely:

**Core Overrides**:
- [ ] `NODE_ENV=production`
- [ ] `PORT` (usually injected automatically by Render/Railway)

**Datastores**:
- [ ] `DATABASE_URL` (PostgreSQL with PgBouncer/connection pooler url, e.g., `?pgbouncer=true&connection_limit=50`)
- [ ] `DIRECT_URL` (Required if using Prisma migrations via separate step)
- [ ] `REDIS_URL` (Required for BullMQ queue, caching, and idempotency states)

**Cryptography**:
- [ ] `JWT_SECRET` (Strict minimum 32 chars, CSPRNG generated)
- [ ] `ENCRYPTION_KEY` (Exactly 64-byte hex string used for resting PII/credential encryption)

**Monitoring & Insights**:
- [ ] `SENTRY_DSN` (Optional but highly recommended for Express error boundaries and Uncaught exceptions)

**Third-Party Gateways**:
- [ ] `DIGIFLAZZ_SECRET`
- [ ] `DIGIFLAZZ_USERNAME`
- [ ] `MIDTRANS_SERVER_KEY`, `MIDTRANS_MERCHANT_ID`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION`
- [ ] `XENDIT_SECRET_KEY`, `XENDIT_CALLBACK_TOKEN`
- [ ] `DUITKU_MERCHANT_CODE`, `DUITKU_MERCHANT_KEY`, `DUITKU_IS_PRODUCTION`

---

## 2. Docker & Infrastructure Resilience Audit
NexusCore uses an advanced multi-stage distroless `Dockerfile`:

- [x] **Zero Root Execution**: Container steps down to `USER 65532:65532` immediately prior to `CMD`.
- [x] **Attack Surface Minimized**: Production container runs on `gcr.io/distroless/nodejs20-debian12`, stripping shell access (`sh`, `bash`), package managers, and root certificates.
- [x] **Graceful Shutdown**: Node process captures `SIGTERM` and `SIGINT`, triggering sequential shutdown protocols:
      1. Closes express ingress `/api/*`.
      2. Safely halts outstanding BullMQ worker tasks.
      3. Drains and disconnects persistent Redis/TLS pools.
      4. Tears down Prisma Rust engine connection pools explicitly.
- [x] **Idempotency Safeguard**: Re-delivery of external webhooks (e.g., from payment gateways) is guarded via `X-Idempotency-Key` and Redis cache to prevent double-funding.

---

## 3. Worker & Monolith Safety
- **Deadlock Safeties**: All Redis clients inside QueueManager are configured with explicit maxretries.
- **Boot Race Conditions**: Express mounts `/health` and `/live` independently of Redis/PostgreSQL boot times, preventing crash-loop unreachability during deep cold starts.
- **Prisma Connection Resiliency**: Prisma engine natively handles disconnects, but health check explicitly verifies SQL handshake (`SELECT 1`).
- **Telemetry Boundaries**: Pino HTTP instrumentation securely tracks UUIDv4 correlation IDs natively propagated through standard REST layers.
