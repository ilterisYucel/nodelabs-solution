# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY . .

# Install dependencies and build
RUN pnpm install
RUN pnpm run build

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

EXPOSE 5000 5001
CMD ["pnpm", "run", "serve"]