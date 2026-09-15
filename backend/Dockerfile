# Multi-stage Dockerfile for PrivPass Backend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY backend/package.json backend/tsconfig.json ./backend/
COPY backend/prisma ./backend/prisma
RUN yarn install --immutable
COPY backend/src ./backend/src
RUN cd backend && npx prisma generate && yarn build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S privpass && adduser -S privpass -G privpass
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma
RUN yarn workspaces focus backend --production
COPY --from=builder /app/backend/dist ./backend/dist
USER privpass
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health/live || exit 1
CMD ["node", "backend/dist/server.js"]
