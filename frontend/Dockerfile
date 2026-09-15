# Multi-stage Dockerfile for PrivPass Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY frontend/package.json frontend/tsconfig.json frontend/vite.config.ts ./frontend/
COPY frontend/index.html ./frontend/
RUN yarn install --immutable
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
RUN cd frontend && yarn build

FROM nginx:alpine AS runner
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1
CMD ["nginx", "-g", "daemon off;"]
