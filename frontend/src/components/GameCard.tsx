"use client";

import { useEffect, useState } from "react";

interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  spread: number;
  status: string;
  message?: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const CAVALIERS = "Cleveland Cavaliers";

function teamAbbrev(name: string) {
  const map: Record<string, string> = {
    "Cleveland Cavaliers": "CLE",
    "Boston Celtics": "BOS",
    "Milwaukee Bucks": "MIL",
    "New York Knicks": "NYK",
    "Philadelphia 76ers": "PHI",
    "Miami Heat": "MIA",
    "Orlando Magic": "ORL",
    "Indiana Pacers": "IND",
    "Chicago Bulls": "CHI",
    "Atlanta Hawks": "ATL",
    "Brooklyn Nets": "BKN",
    "Toronto Raptors": "TOR",
    "Detroit Pistons": "DET",
    "Charlotte Hornets": "CHA",
    "Washington Wizards": "WAS",
    "Oklahoma City Thunder": "OKC",
    "Denver Nuggets": "DEN",
    "Minnesota Timberwolves": "MIN",
    "Dallas Mavericks": "DAL",
    "Phoenix Suns": "PHX",
    "Los Angeles Lakers": "LAL",
    "Los Angeles Clippers": "LAC",
    "Sacramento Kings": "SAC",
    "Golden State Warriors": "GSW",
    "Houston Rockets": "HOU",
    "Memphis Grizzlies": "MEM",
    "New Orleans Pelicans": "NOP",
    "San Antonio Spurs": "SAS",
    "Portland Trail Blazers": "POR",
    "Utah Jazz": "UTA",
  };
  return map[name] || name.slice(0, 3).toUpperCase();
}

function formatGameTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  if (diffMs < 0) return { dateStr, timeStr, countdown: "Started" };
  if (diffH > 24) return { dateStr, timeStr, countdown: `${Math.floor(diffH / 24)}d ${diffH % 24}h` };
  if (diffH > 0) return { dateStr, timeStr, countdown: `${diffH}h ${diffM}m` };
  return { dateStr, timeStr, countdown: `${diffM}m` };
}

export default function GameCard({
  onGameLoaded,
}: {
  onGameLoaded?: (game: Game | null) => void;
}) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/games/next`)
      .then((r) => r.json())
      .then((data: Game) => {
        if (data.gameId) {
          setGame(data);
          onGameLoaded?.(data);
        } else {
          setGame(null);
          onGameLoaded?.(null);
        }
      })
      .catch(() => {
        setGame(null);
        onGameLoaded?.(null);
      })
      .finally(() => setLoading(false));
  }, [onGameLoaded]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-center gap-8">
          <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-12 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="animate-fade-in rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          No upcoming Cavaliers game scheduled
        </p>
      </div>
    );
  }

  const opponent =
    game.homeTeam === CAVALIERS ? game.awayTeam : game.homeTeam;
  const cavsHome = game.homeTeam === CAVALIERS;
  const { dateStr, timeStr, countdown } = formatGameTime(game.startTime);
  const spreadDisplay =
    game.spread > 0 ? `+${game.spread}` : `${game.spread}`;

  return (
    <div className="animate-fade-in overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-cavs-wine via-cavs-gold to-cavs-navy" />

      <div className="p-6 sm:p-8">
        {/* Matchup */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {/* Away team */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-md transition-transform hover:scale-105 sm:h-20 sm:w-20 sm:text-xl ${
                !cavsHome
                  ? "bg-cavs-wine"
                  : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            >
              {teamAbbrev(cavsHome ? opponent : CAVALIERS)}
            </div>
            <span className="max-w-[100px] text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 sm:max-w-[120px] sm:text-sm">
              {cavsHome ? opponent : CAVALIERS}
            </span>
          </div>

          {/* VS / Info */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {cavsHome ? "HOME" : "AWAY"}
            </span>
            <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-600">
              @
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              {cavsHome ? "AWAY" : "HOME"}
            </span>
          </div>

          {/* Home team */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white shadow-md transition-transform hover:scale-105 sm:h-20 sm:w-20 sm:text-xl ${
                cavsHome
                  ? "bg-cavs-wine"
                  : "bg-zinc-400 dark:bg-zinc-600"
              }`}
            >
              {teamAbbrev(cavsHome ? CAVALIERS : opponent)}
            </div>
            <span className="max-w-[100px] text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 sm:max-w-[120px] sm:text-sm">
              {cavsHome ? CAVALIERS : opponent}
            </span>
          </div>
        </div>

        {/* Game details */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
            <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {dateStr}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1.5 dark:bg-zinc-800">
            <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {timeStr}
            </span>
          </div>
          <div className="rounded-full bg-cavs-wine/10 px-3 py-1.5">
            <span className="text-xs font-bold text-cavs-wine dark:text-cavs-gold">
              Spread: {spreadDisplay}
            </span>
          </div>
          <div className="rounded-full bg-cavs-gold/20 px-3 py-1.5">
            <span className="text-xs font-bold text-cavs-navy dark:text-cavs-gold">
              {countdown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
