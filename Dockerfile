# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy only package files first (layer caching optimization)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# ─── Stage 2: Final image ─────────────────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY app.js ./
COPY public ./public

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

USER appuser

# Expose application port
EXPOSE 3000

# Environment variables (can be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=3000

# Health check (used by Docker and Kubernetes)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "app.js"]
