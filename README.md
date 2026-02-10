# Uptop-Rain - Play-to-Earn Cavaliers Betting App

A Play-to-Earn betting web app where users bet on the point spread of Cleveland Cavaliers NBA games. Correct bets earn 100 points.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (package manager)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

## Project Structure

```
root/
├── frontend/     # Next.js 16 app (port 3000)
├── backend/      # NestJS app (port 3001)
├── context/      # Project spec & build checklist
├── CLAUDE.md     # Dev instructions
└── README.md     # This file
```

## Getting Started

### 1. Install Dependencies

```bash
cd backend && bun install
cd ../frontend && bun install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```
MONGODB_URI=mongodb://localhost:27017/uptop-rain
ODDS_API_KEY=<your_odds_api_key>
ADMIN_API_KEY=<generate_a_secret>
NEXTAUTH_SECRET=<shared_secret_with_frontend>
FRONTEND_URL=http://localhost:3000
PORT=3001
```

**Frontend** (`frontend/.env.local`):
```
NEXTAUTH_SECRET=<same_secret_as_backend>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Generate secrets with:
```bash
openssl rand -base64 32   # NEXTAUTH_SECRET
openssl rand -hex 32      # ADMIN_API_KEY
```

### 3. Start the Apps

```bash
# Terminal 1 - Backend
cd backend && bun run start:dev

# Terminal 2 - Frontend
cd frontend && bun run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS, next-auth v5
- **Backend**: NestJS, TypeScript, Mongoose
- **Database**: MongoDB
- **External API**: The Odds API v4 (NBA spreads)
