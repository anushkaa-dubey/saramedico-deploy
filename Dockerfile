# =====================================================
# SARAMEDICO FRONTEND - PRODUCTION DOCKER IMAGE
# Multi-stage build using Next.js standalone output
# =====================================================

# ============= Stage 1: Dependencies =============
FROM node:20-alpine AS deps
WORKDIR /app

# Copy lock files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies (clean install for reproducibility)
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --network-timeout=1000000

# ============= Stage 2: Builder =============
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arg: the backend API URL baked into the client bundle at build time
# On EC2 this should point to the public IP or domain, e.g.:
#   http://<EC2_PUBLIC_IP>:8000/api/v1
ARG NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build the Next.js application (produces .next/standalone)
RUN npm run build

# ============= Stage 3: Runner =============
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone server (includes only production node_modules)
COPY --from=builder /app/.next/standalone ./

# Copy static assets & public folder (not included in standalone by default)
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set correct ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The standalone output creates a server.js at the root
CMD ["node", "server.js"]
