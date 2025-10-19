# Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY ./package*.json ./

# Install dependencies
RUN npm install --omit=optional && npm cache clean --force

# Copy source code from frontend directory
COPY . .

# Build the application
RUN npm run build:frontend

# Production stage
FROM node:22-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup --gid 1001 --system nodejs && \
    adduser --system --uid 1001 nextjs

# Install tini for proper signal handling
RUN apk add --no-cache tini

# Get necessary directories from builder stage
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001 || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Run as non-root user
USER nextjs

# Start the application
CMD ["node", "server.js"]