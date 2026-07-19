# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies separately for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- Stage 2: Build Next.js app ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all application source
COPY . .

# Build production Next.js bundle
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- Stage 3: Production runtime image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root system user (security best practice)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only production output files from builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]
