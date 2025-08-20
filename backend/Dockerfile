FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install all dependencies including devDependencies
RUN pnpm install

# Copy source code
COPY . .

# Ensure uploads directory exists and has correct permissions
RUN mkdir -p /app/uploads && \
    chmod 777 /app/uploads

# Copy .env file
COPY .env.example .env

EXPOSE 8000

CMD ["pnpm", "start"]
