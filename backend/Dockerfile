<<<<<<< HEAD
# =========================================
# ITjobx — Backend Dockerfile
# Express + Node.js project
# =========================================

# ─── Stage 1: Install production deps ─────
FROM node:20-alpine AS base
WORKDIR /app

# Install only production dependencies (cached)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# ─── Stage 2: Runtime ----------------------
FROM node:20-alpine
WORKDIR /app

# Copy node_modules from the base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application source
COPY . .

# Runtime configuration
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the server (ensure a `start` script exists in package.json)
=======
FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads \
  && chown -R node:node /app

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:5000/', (res) => process.exit(res.statusCode < 500 ? 0 : 1)).on('error', () => process.exit(1))"

>>>>>>> 3b700a476678d649c6b7e8c1e421fdfe22a45369
CMD ["npm", "start"]
