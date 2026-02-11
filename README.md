# Uptop-Rain — Play-to-Earn Cavaliers Betting App

A Play-to-Earn betting web app where users bet on the point spread of Cleveland Cavaliers NBA games. Correct bets earn 100 points. Real odds are fetched from [The Odds API v4](https://the-odds-api.com/), and an admin settles bets by submitting final scores via cURL or through the admin panel UI. Bets can also be auto-settled via cron jobs that periodically poll the Scores API.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Admin Operations (cURL)](#admin-operations-curl)
- [API Reference](#api-reference)
- [Settlement Logic](#settlement-logic)
- [Cron Jobs](#cron-jobs)
- [Health & Monitoring](#health--monitoring)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) (package manager)
- [MongoDB](https://www.mongodb.com/) (local or Atlas) — or use Docker
- An API key from [The Odds API](https://the-odds-api.com/) (free tier available)

---

## Quick Start (Docker)

The fastest way to run everything (frontend, backend, MongoDB) with a single command:

```bash
# 1. Clone the repo
git clone <repo-url> && cd root

# 2. Create env files (see Environment Variables section below)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
# Edit both files and fill in your secrets

# 3. Start all services
docker compose up --build
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **MongoDB:** localhost:27017

To stop: `docker compose down` (add `-v` to also remove the database volume).

---

## Manual Setup

### 1. Install Dependencies

```bash
cd backend && bun install
cd ../frontend && bun install
```

### 2. Start MongoDB

Either run MongoDB locally or use a hosted instance (e.g., MongoDB Atlas). The default connection string points to `mongodb://localhost:27017/uptop-rain`.

### 3. Configure Environment Variables

See the [Environment Variables](#environment-variables) section below.

### 4. Start the Apps

```bash
# Terminal 1 — Backend
cd backend && bun run start:dev

# Terminal 2 — Frontend
cd frontend && bun run dev
```

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/uptop-rain` |
| `ODDS_API_KEY` | API key from The Odds API | `ff351b3d...` |
| `ODDS_API_ENDPOINT` | Odds API endpoint | `https://api.the-odds-api.com/v4/sports/basketball_nba/odds` |
| `ADMIN_API_KEY` | Secret key for admin cURL operations | `fa211e2a...` |
| `NEXTAUTH_SECRET` | Shared JWT secret (must match frontend) | `57k8A36H...` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |
| `PORT` | Backend port | `3001` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_SECRET` | Shared JWT secret (must match backend) | `57k8A36H...` |
| `NEXTAUTH_URL` | Canonical URL of the frontend | `http://localhost:3000` |
| `NEXT_PUBLIC_BACKEND_URL` | Backend API base URL | `http://localhost:3001` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | `299563...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) | `GOCSPX-...` |

### Generating Secrets

```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -hex 32      # ADMIN_API_KEY
```

---

## Running the App

### Development

```bash
# Backend (hot reload)
cd backend && bun run start:dev

# Frontend (hot reload)
cd frontend && bun run dev
```

### Production Build

```bash
cd backend && bun run build && bun run start
cd frontend && bun run build && bun run start
```

---

## Admin Operations (cURL)

Admin operations can be performed via cURL (shown below) or through the admin panel UI at `/admin`. The admin panel provides a dashboard for fetching games, viewing health status, and triggering settlements without needing to run cURL commands manually.

### Fetch Next Cavaliers Game from Odds API

Pulls the next upcoming Cavaliers game from The Odds API and stores it in the database:

```bash
curl -X POST http://localhost:3001/games/next \
  -H "x-admin-api-key: <YOUR_ADMIN_API_KEY>"
```

### Get the Current Next Game

```bash
curl http://localhost:3001/games/next
```

### Settle a Game

After a game finishes, submit the final scores to settle all bets:

```bash
curl -X POST http://localhost:3001/games/<GAME_ID>/settle \
  -H "x-admin-api-key: <YOUR_ADMIN_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"finalHomeScore": 110, "finalAwayScore": 105}'
```

The `<GAME_ID>` is the `gameId` field from the game document (the Odds API event ID, e.g., `abc123def456`). You can get it from `GET /games/next`.

### Example Full Workflow

```bash
ADMIN_KEY="your_admin_api_key_here"

# 1. Fetch and store the next Cavs game
curl -X POST http://localhost:3001/games/next \
  -H "x-admin-api-key: $ADMIN_KEY"

# 2. (Users place bets via the frontend UI)

# 3. After the game ends, settle with final scores
curl -X POST http://localhost:3001/games/abc123def456/settle \
  -H "x-admin-api-key: $ADMIN_KEY" \
  -H "Content-Type: application/json" \
  -d '{"finalHomeScore": 110, "finalAwayScore": 105}'
```

---

## API Reference

### Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | None | Register with email + password |
| `POST` | `/auth/login` | None | Login with email + password |
| `POST` | `/auth/google` | None | Google OAuth sign-in |
| `GET` | `/auth/me` | User (Bearer JWT) | Get current user's email and points |

### Games

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/games/next` | Public | Get the next upcoming Cavaliers game |
| `POST` | `/games/next` | Admin (`x-admin-api-key`) | Fetch from Odds API and store |

### Bets

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/bets` | User (Bearer JWT) | Place a bet on the current game |
| `GET` | `/bets` | User (Bearer JWT) | List the authenticated user's bets |

### Settlement

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/games/:gameId/settle` | Admin (`x-admin-api-key`) | Submit final scores and settle all bets |

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | Public | Health check (MongoDB + Odds API status) |

### Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Game not found",
  "timestamp": "2026-02-10T12:00:00Z"
}
```

---

## Settlement Logic

The spread is stored relative to the Cavaliers. When a game is settled:

```
cavsMargin = (Cavs score) - (Opponent score)
adjustedMargin = cavsMargin + spread
```

| User's Pick | adjustedMargin > 0 | adjustedMargin < 0 | adjustedMargin = 0 |
|-------------|---------------------|---------------------|--------------------|
| Cavaliers | **Won** (+100 pts) | Lost | Push |
| Opponent | Lost | **Won** (+100 pts) | Push |

**Example:** Cavs 110, Heat 105, Spread -4.5 (Cavs favored by 4.5)
- `cavsMargin = 5`, `adjustedMargin = 5 + (-4.5) = 0.5`
- Picked Cavaliers → Won (+100 pts)
- Picked Opponent → Lost

---

## Cron Jobs

Two scheduled tasks run every 3 hours on the backend, powered by `@nestjs/schedule`:

### Odds Refresh
Calls `OddsService.fetchNextCavsGame()` and upserts the result into the database. This keeps the next game and its spread up to date without requiring a manual admin cURL call.

### Auto-Settle
Finds all games with status `upcoming` whose `startTime` has passed, then polls the Scores API for final results. When a completed score is found, the game is automatically settled and all associated bets are resolved — the same logic as the manual `POST /games/:gameId/settle` endpoint.

### API Budget
Each cron cycle consumes at most 2 Odds API requests (1 odds + 1 scores). Running every 3 hours over a 30-day month yields approximately 480 requests, which stays within the 500-request free tier limit.

Smart skipping is applied: the scores poll is skipped entirely if there are no unsettled games with a past start time, preserving budget during idle periods.

---

## Health & Monitoring

### GET /health

A public endpoint that reports the live status of backend dependencies:

```json
{
  "status": "ok",
  "info": {
    "mongodb": { "status": "up" },
    "oddsApi": { "status": "up" }
  }
}
```

Returns HTTP 200 when all checks pass, or HTTP 503 when one or more checks fail. Powered by `@nestjs/terminus`.

### Admin Panel (`/admin`)

The frontend exposes an admin panel at `/admin` (protected by the admin API key entered in-browser). It provides:

- A health dashboard showing live MongoDB and Odds API status
- A button to fetch and store the next Cavaliers game from the Odds API
- A settlement form for submitting final scores without needing cURL

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS | UI with SSR/CSR |
| Auth | next-auth v5 (JWT strategy) | Session management + Google OAuth |
| Backend | NestJS + TypeScript + Mongoose | REST API + business logic |
| Database | MongoDB | Users, Games, Bets |
| External | The Odds API v4 | Real NBA spreads |
| Package Manager | Bun | Fast installs and scripts |
| Scheduling | @nestjs/schedule | Cron jobs (odds refresh, auto-settle) |
| Rate Limiting | @nestjs/throttler | Request throttling |
| Health Checks | @nestjs/terminus | Service monitoring |
| HTTP Resilience | axios-retry | Retry with backoff + circuit breaker |

---

## Project Structure

```
root/
├── frontend/                 # Next.js 16 app (port 3000)
│   ├── src/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── app/
│   │   │   ├── page.tsx      # Main betting page
│   │   │   ├── admin/        # Admin panel (game fetch, health, settlement)
│   │   │   │   └── page.tsx
│   │   │   ├── signin/       # Sign-in page
│   │   │   └── register/     # Registration page
│   │   ├── components/
│   │   │   ├── GameCard.tsx   # Game display + countdown
│   │   │   ├── BetForm.tsx    # Place bet UI
│   │   │   ├── BetList.tsx    # Bet history table
│   │   │   ├── PointsCard.tsx # User points display
│   │   │   └── ...           # Theme, auth, accent components
│   │   └── contexts/         # Theme + accent color providers
│   └── .env.example
├── backend/                  # NestJS app (port 3001)
│   ├── src/
│   │   ├── auth/             # Auth controller, service, DTOs
│   │   ├── games/            # Games controller, service, odds, settlement
│   │   │   └── cron.service.ts  # Scheduled odds refresh + auto-settle
│   │   ├── bets/             # Bets controller, service, DTOs
│   │   ├── health/           # Health check controller + indicators
│   │   ├── schemas/          # Mongoose schemas (User, Game, Bet)
│   │   └── common/           # Guards (Auth, Admin) + exception filter
│   └── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml            # CI pipeline (lint, build, test)
├── context/                  # Project spec & reference docs
├── docker-compose.yml        # Run everything with one command
├── CLAUDE.md                 # Dev instructions for AI assistant
└── README.md                 # This file
```
