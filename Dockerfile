# Use Bun official image
FROM oven/bun:1.1.42-alpine

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY --chown=bunjs:nodejs . .

# Build the application
RUN bun run build

# Switch to non-root user
USER bunjs

# Expose port
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start the application
CMD ["bun", "run", "start"]
