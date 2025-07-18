# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY . .

# Install dependencies and build
RUN pnpm install
RUN pnpm run build && \
    find dist -type f -name "*.js" -exec sed -i 's/http_1.createServer/http.createServer/g' {} \;

# Production stage
FROM node:22-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./

# Install production dependencies only
RUN pnpm install --prod

EXPOSE 5000
CMD ["pnpm", "run", "serve"]
