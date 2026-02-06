# Base image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app

# Install packages needed for builds
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Compile the custom server
RUN npx tsc server.ts --esModuleInterop --skipLibCheck

# Build Next.js app
RUN npm run build

# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy built application
# We use standalone mode which bundles necessary node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy compiled custom server
COPY --from=builder --chown=nextjs:nodejs /app/server.js ./

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Run the custom server
CMD ["node", "server.js"]
