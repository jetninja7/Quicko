FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @quicko/customer-app --docker

FROM base AS installer
WORKDIR /app
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
RUN npm run build --filter=@quicko/customer-app

FROM base AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=installer /app/apps/customer-app/next.config.mjs .
COPY --from=installer /app/apps/customer-app/package.json .
COPY --from=installer --chown=nextjs:nodejs /app/apps/customer-app/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/customer-app/.next/static ./apps/customer-app/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/customer-app/public ./apps/customer-app/public

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/customer-app/server.js"]
