# Multi-stage build for NestJS with pnpm
FROM node:20-alpine AS base

# Install pnpm
RUN corepack enable pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Dependencies stage
FROM base AS deps
RUN apk add --no-cache libc6-compat
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build application
RUN pnpm run build

# Production stage
FROM node:20-alpine AS runner
RUN corepack enable pnpm

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nestjs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nestjs /app/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/package.json ./package.json
# Copy assets directory for runtime usage (rich menu images, etc.)
COPY --from=builder --chown=nestjs:nestjs /app/assets ./assets

USER nestjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

CMD ["node", "dist/main"] 