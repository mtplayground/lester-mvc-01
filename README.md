# Lester MVC

Kanban-style task management app with a React frontend and an Express + Prisma backend.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: Express, TypeScript, Prisma
- Database: PostgreSQL
- Auth: JWT

## Repository Structure

- `client/` React frontend
- `server/` Express API + Prisma schema/migrations
- `Dockerfile` Backend container build
- `client/Dockerfile` Frontend container build
- `docker-compose.yml` Local container orchestration

## Environment Variables

Copy `.env.example` and adjust values for your environment.

Required variables:

- `PORT`: API port (default `3000`)
- `DATABASE_URL`: PostgreSQL connection string for the backend
- `JWT_SECRET`: secret used to sign auth tokens
- `JWT_EXPIRES_IN`: token expiration (for example `7d`)
- `VITE_API_BASE_URL`: frontend API base URL (for example `http://localhost:3000/api`)

Testing variable:

- `TEST_DATABASE_URL`: dedicated DB for backend API integration tests

## Local Development (Node)

Prerequisites:

- Node.js 20+
- PostgreSQL 16+

Install dependencies:

```bash
npm install
```

Start frontend and backend in parallel:

```bash
npm run dev
```

Services:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`

## Build

Build both workspaces:

```bash
npm run build
```

## Tests

Backend:

```bash
npm test -w server
```

Frontend:

```bash
npm test -w client
```

## Run with Docker Compose

Build and run all services:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

Stop:

```bash
docker compose down
```

Stop and remove DB volume:

```bash
docker compose down -v
```

## Railway Deployment

Create two Railway services from this repository.

### 1) Backend service

- Root Directory: repository root
- Dockerfile Path: `Dockerfile`
- Exposed Port: `3000`
- Required env vars:
  - `PORT=3000`
  - `DATABASE_URL=<Railway Postgres connection string>`
  - `JWT_SECRET=<strong random string>`
  - `JWT_EXPIRES_IN=7d`

### 2) Frontend service

- Root Directory: repository root
- Dockerfile Path: `client/Dockerfile`
- Exposed Port: `8080`
- Required env vars:
  - `VITE_API_BASE_URL=https://<backend-service-domain>/api`

After deploying backend, update frontend `VITE_API_BASE_URL` to the backend public URL and redeploy the frontend service.
