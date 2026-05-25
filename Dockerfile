# ==========================
# Phase 1: dependencies & build
# ==========================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build essential dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy configurations
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install with absolute version compliance
RUN npm ci --include=dev

# Copy source code
COPY . .

# Generate Client codes (Prisma if PostgreSQL/MySQL url present)
# RUN npx prisma generate

# Build optimal production assets
RUN npm run build

# ==========================
# Phase 2: Runtime image base
# ==========================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY package*.json ./

# Install production-only dependencies precisely
RUN npm ci --only=production --ignore-scripts --prefer-offline

# Copy build artifacts & server configurations
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

# Keep permission configurations secure
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

# Start server node using tsx or compiled server artifact
CMD ["node", "dist/server.cjs"]
