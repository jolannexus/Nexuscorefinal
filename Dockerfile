# ==========================
# Phase 1: dependencies & build
# ==========================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build essential dependencies
RUN apt-get update && apt-get install -y python3 make g++ libc6-dev && rm -rf /var/lib/apt/lists/*

# Copy configurations
COPY package*.json ./
COPY tsconfig.json ./
# vite.config.ts might not exist or might, copy it if present. Best to just copy all root configs.
COPY . .

# Install with absolute version compliance
RUN npm ci

# Generate Client codes (Prisma)
RUN npx prisma generate

# Build optimal production assets
RUN npm run build

# ==========================
# Phase 2: Production dependencies
# ==========================
FROM node:20-bookworm-slim AS deps

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --ignore-scripts --prefer-offline
RUN npx prisma generate

# ==========================
# Phase 3: Runtime image base (Distroless)
# ==========================
FROM gcr.io/distroless/nodejs20-debian12 AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/prisma ./prisma

# Copy build artifacts & server configurations
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Require non-root user (distroless uses 65532 for nonroot user)
USER 65532:65532

# Start server node using compiled server artifact
CMD ["dist/server.cjs"]
