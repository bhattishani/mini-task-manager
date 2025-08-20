# Mini Task Manager V1.0

A simple task management application built with Next.js, Node.js, and MongoDB.

## Tech Stack

- Frontend: Next.js with TypeScript
- Backend: Node.js/Express
- Database: MongoDB
- Containerization: Docker

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- pnpm (package manager)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/bhattishani/mini-task-manager.git
cd mini-task-manager
```

2. Create `.env` files:

   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`

3. Build and start the application:

```bash
# Start all services
docker compose up -d
```

4. Access the application:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

5. Default Admin Credentials
   - Email: admin@gmail.com
   - Password: 123456

## Docker Commands

```bash
# Start all services in detached mode
docker compose up -d

# Stop and remove all containers (keeps volumes/data)
docker compose down

# Restart all services
docker compose restart

# View logs for all services
docker compose logs -f

# View logs for a specific service (mongodb | backend | frontend)
docker compose logs -f <service_name>

# Build images (use cache if available)
docker compose build

# Build images without cache (force fresh build)
docker compose build --no-cache

# Start after build
docker compose up -d

# Stop & remove containers + networks + volumes (project only)
docker compose down -v --remove-orphans

# Remove one specific service (mongodb | backend | frontend)
docker compose rm -sfv <service_name>

# Global cleanup (⚠️ removes ALL containers/images/volumes on your system)
docker system prune -a --volumes

# Check status of all services
docker compose ps

# Exec into a service container (e.g., backend)
docker compose exec backend sh

# Restart only one service
docker compose restart frontend

```

## Development

For local development:

```bash
# Backend
cd backend
pnpm install
pnpm run dev --port=8000

# Frontend
cd frontend
pnpm install
pnpm run dev --port=3000
```

## Project Structure

```
├── backend/           # Node.js backend application
│   ├── src/           # Source code
│   └── Dockerfile     # Backend container configuration
├── frontend/          # Next.js frontend application
│   ├── app/           # Application code
│   └── Dockerfile     # Frontend container configuration
└── docker-compose.yml # Docker compose configuration
```

## Container Services

- **Frontend**: Next.js application (Port 3000)
- **Backend**: Node.js/Express API (Port 8000)
- **MongoDB**: Database (Port 27017)

Each service is containerized and configured in `docker-compose.yml` for easy deployment and development.
