# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runtime image for the `app` service — standalone Next.js output only.
FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads
USER nextjs

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]

# Image used by the one-shot `migrate` service — needs drizzle-kit (a
# devDependency) and the full source tree, unlike the slim runner above.
FROM base AS migrator
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npx", "drizzle-kit", "migrate"]
