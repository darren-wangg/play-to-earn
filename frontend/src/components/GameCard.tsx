"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { getTeam } from "@/constants/nba-teams";

interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  spread: number;
  status: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const CAVALIERS = "Cleveland Cavaliers";

function computeCountdown(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  const diffM = Math.floor((diffMs % 3600000) / 60000);

  if (diffMs < 0) return "Started";
  if (diffH >= 24) {
    const days = Math.floor(diffH / 24);
    return `${days}d ${diffH % 24}h`;
  }
  if (diffH > 0) return `${diffH}h ${diffM}m`;
  return `${diffM}m`;
}

function formatGameTime(iso: string) {
  const d = new Date(iso);

  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
  const dateStr = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return { dateStr, timeStr };
}

function TeamLogo({ teamName }: { teamName: string }) {
  const team = getTeam(teamName);

  if (team.logo) {
    return (
      <Image
        src={team.logo}
        alt={team.name}
        width={80}
        height={80}
        className="h-20 w-20 object-contain drop-shadow-lg sm:h-24 sm:w-24"
        unoptimized
      />
    );
  }

  return (
    <div
      className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white sm:h-24 sm:w-24"
      style={{ backgroundColor: team.primaryColor }}
    >
      {team.abbrev}
    </div>
  );
}

export default function GameCard({
  onGameLoaded,
}: {
  onGameLoaded?: (game: Game | null) => void;
}) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch(`${BACKEND}/games/next`)
      .then((r) => r.json())
      .then((data: Game) => {
        if (data.gameId) {
          setGame(data);
          setCountdown(computeCountdown(data.startTime));
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

  // Live countdown: update every 60 seconds
  const updateCountdown = useCallback(() => {
    if (game) setCountdown(computeCountdown(game.startTime));
  }, [game]);

  useEffect(() => {
    if (!game) return;
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [game, updateCountdown]);

  if (loading) {
    return (
      <div className="animate-pulse overflow-hidden rounded-2xl bg-zinc-900 p-8">
        <div className="flex items-center justify-center gap-8">
          <div className="h-20 w-20 rounded-full bg-zinc-700" />
          <div className="h-8 w-12 rounded bg-zinc-700" />
          <div className="h-20 w-20 rounded-full bg-zinc-700" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="animate-fade-in overflow-hidden rounded-2xl bg-zinc-900 p-8 text-center">
        <p className="text-lg text-zinc-400">No upcoming games</p>
      </div>
    );
  }

  const opponent = game.homeTeam === CAVALIERS ? game.awayTeam : game.homeTeam;
  const cavsHome = game.homeTeam === CAVALIERS;
  const { dateStr, timeStr } = formatGameTime(game.startTime);
  const spreadDisplay = game.spread > 0 ? `+${game.spread}` : `${game.spread}`;

  const awayTeam = cavsHome ? opponent : CAVALIERS;
  const homeTeam = cavsHome ? CAVALIERS : opponent;
  const awayColor = getTeam(awayTeam).primaryColor;
  const homeColor = getTeam(homeTeam).primaryColor;
  const awayAbbrev = getTeam(awayTeam).abbrev;
  const homeAbbrev = getTeam(homeTeam).abbrev;
  const homeCity = getTeam(homeTeam).city;

  return (
    <div className="animate-fade-in overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
      {/* Matchup area with team color split */}
      <div className="relative flex items-stretch">
        {/* Away team half */}
        <div
          className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10"
          style={{ backgroundColor: awayColor + "30" }}
        >
          <TeamLogo teamName={awayTeam} />
        </div>

        {/* VS badge */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-bold text-white shadow-lg ring-2 ring-zinc-700 sm:h-12 sm:w-12 sm:text-base">
            VS
          </div>
        </div>

        {/* Home team half */}
        <div
          className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10"
          style={{ backgroundColor: homeColor + "30" }}
        >
          <TeamLogo teamName={homeTeam} />
        </div>
      </div>

      {/* Game info section */}
      <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
        {/* Matchup title */}
        <h3 className="text-base font-bold uppercase tracking-wide text-white sm:text-lg">
          {awayAbbrev} vs {homeAbbrev}
        </h3>

        {/* Details row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {dateStr}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {timeStr}
          </span>
          {homeCity && (
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {homeCity}
            </span>
          )}
        </div>

        {/* Bottom pills */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5">
            <svg className="h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-white">{countdown}</span>
          </div>
          <div className="rounded-full bg-cavs-wine px-4 py-1.5">
            <span className="text-xs font-bold text-white">
              Spread: CLE {spreadDisplay}
            </span>
          </div>
          <div className="rounded-full bg-cavs-gold/20 px-4 py-1.5">
            <span className="text-xs font-bold text-cavs-gold">
              Win +100 points
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
