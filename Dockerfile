# Use Bun official image
FROM oven/bun:1.1.42-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Create final stage
FROM oven/bun:1.1.42-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunjs

# Copy built application
COPY --from=base --chown=bunjs:nodejs /app .

# Switch to non-root user
USER bunjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start the application
CMD ["bun", "run", "start"]
