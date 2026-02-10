# Play-to-Earn Betting App (Uptop-Rain Coding Challenge)

## Project Overview
A Play-to-Earn betting web app where users bet on the point spread of Cleveland Cavaliers NBA games. Correct bets earn 100 points. Real odds from The Odds API v4. Admin settles bets via cURL.

## Tech Stack
- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS + next-auth (v5 beta)
- **Backend**: NestJS + TypeScript + Mongoose
- **Database**: MongoDB
- **External API**: The Odds API v4 (NBA spreads)
- **Package Manager**: Bun
- **Runtime**: Node.js (Bun for package management)

## Monorepo Structure
```
root/
├── frontend/          # Next.js app (port 3000)
├── backend/           # NestJS app (port 3001)
├── context/           # Project spec & build checklist (reference only)
├── CLAUDE.md          # This file
└── .gitignore
```

## Key Commands
```bash
# Backend
cd backend && bun run start:dev    # Dev mode with hot reload
cd backend && bun run start        # Production mode
cd backend && bun run build        # Build

# Frontend
cd frontend && bun run dev         # Dev mode (port 3000)
cd frontend && bun run build       # Production build

# Bun path (if not in PATH)
/Users/darrenwang/.bun/bin/bun
```

## Architecture
- Backend on port 3001, Frontend on port 3000
- CORS enabled on backend for frontend origin
- JWT-based auth: next-auth issues tokens, backend validates with shared NEXTAUTH_SECRET
- AdminGuard: checks `x-admin-api-key` header
- AuthGuard: validates JWT Bearer token

## Data Models
- **User**: email, points (starts 0), timestamps
- **Game**: gameId (unique, from Odds API), homeTeam, awayTeam, startTime, spread, status (upcoming|finished), finalHomeScore?, finalAwayScore?
- **Bet**: userId (ref User), gameId (ref Game), selection (cavaliers|opponent), status (pending|won|lost|push) — compound unique index on (userId, gameId)

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /games/next | Public | Next upcoming Cavs game |
| POST | /games/next | Admin | Fetch & store from Odds API |
| POST | /bets | User JWT | Place a bet |
| GET | /bets | User JWT | List user's bets |
| POST | /games/:gameId/settle | Admin | Submit scores, settle bets |

## Settlement Logic
```
actualMargin = finalHomeScore - finalAwayScore
adjustedMargin = actualMargin + spread  (spread stored relative to Cavs)

Picked "cavaliers": adjustedMargin > 0 = won (+100pts), < 0 = lost, === 0 = push
Picked "opponent":  adjustedMargin < 0 = won (+100pts), > 0 = lost, === 0 = push
```

## Environment Variables
### Backend (.env)
- MONGODB_URI, ODDS_API_KEY, ADMIN_API_KEY, NEXTAUTH_SECRET, FRONTEND_URL, PORT

### Frontend (.env.local)
- NEXTAUTH_SECRET, NEXTAUTH_URL, NEXT_PUBLIC_BACKEND_URL

## Build Phases (from context/todos.pdf)
- [x] Phase 0: Scaffolding (monorepo structure, deps, env vars, module stubs, schemas, guards, frontend shell)
- [x] Phase 1: Data Models & Database
- [x] Phase 2: Odds API Integration
- [x] Phase 3: Authentication
- [ ] Phase 4: Betting Endpoints
- [ ] Phase 5: Settlement
- [ ] Phase 6: Frontend UI
- [ ] Phase 7: Polish & Edge Cases
- [ ] Phase 8: Documentation & Cleanup
- [ ] Phase 9: Bonus Features
- [ ] Phase 10: Testing: Unit Tests + Basic e2e Tests

## Conventions
- Use Bun for all package management (`bun add`, `bun install`)
- NestJS modules: AuthModule, GamesModule, BetsModule
- Spread always stored relative to Cavaliers (not home team)
- One bet per user per game (enforced by DB unique index)
- Admin operations via cURL only (no admin UI in MVP)
- Periodically add to the root README.md file to document how to run everything. Including env variables, commands to start backend and frontend, etc.

## Git
- I want each Phase to be submitted as a feature branch, against a main branch that I will periodically merge into
- Instead of continual commits, group related smaller commits into a feature branch, and then submit that branch once the phase is done
