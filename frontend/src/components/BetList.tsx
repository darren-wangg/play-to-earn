"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface BetGame {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  spread: number;
  startTime: string;
  status: string;
  finalHomeScore?: number;
  finalAwayScore?: number;
}

interface Bet {
  _id: string;
  gameId: BetGame;
  selection: string;
  status: string;
  createdAt: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const CAVALIERS = "Cleveland Cavaliers";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
  },
  won: {
    label: "Won +100",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-400",
  },
  lost: {
    label: "Lost",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
  },
  push: {
    label: "Push",
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-400",
  },
};

export default function BetList({ refreshKey }: { refreshKey: number }) {
  const { data: session } = useSession();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBets = useCallback(() => {
    if (!session?.accessToken) return;
    setLoading(true);
    fetch(`${BACKEND}/bets`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data: Bet[]) => {
        if (Array.isArray(data)) setBets(data);
      })
      .catch(() => setBets([]))
      .finally(() => setLoading(false));
  }, [session?.accessToken]);

  useEffect(() => {
    fetchBets();
  }, [fetchBets, refreshKey]);

  if (!session) {
    return (
      <div className="animate-fade-in rounded-xl border border-dashed border-cavs-wine/25 bg-cavs-wine/5 p-6 text-center dark:border-cavs-wine/30 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to view your bet history
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="animate-fade-in rounded-xl border border-cavs-wine/15 bg-white p-6 text-center dark:border-cavs-wine/20 dark:bg-zinc-900">
        <svg className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No bets yet. Place your first bet above!
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children space-y-3">
      {bets.map((bet) => {
        const game = bet.gameId;
        const opponent = game.homeTeam === CAVALIERS ? game.awayTeam : game.homeTeam;
        const pickedTeam = bet.selection === "cavaliers" ? "Cavaliers" : opponent;
        const cfg = statusConfig[bet.status] || statusConfig.pending;
        const gameDate = new Date(game.startTime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const hasScore = game.finalHomeScore != null && game.finalAwayScore != null;

        return (
          <div
            key={bet._id}
            className="rounded-xl border border-cavs-wine/15 bg-white p-4 transition-shadow hover:shadow-md dark:border-cavs-wine/20 dark:bg-zinc-900 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {game.homeTeam === CAVALIERS ? "CLE" : opponent.slice(0, 3).toUpperCase()}{" "}
                    vs{" "}
                    {game.homeTeam !== CAVALIERS ? "CLE" : opponent.slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-xs text-zinc-400">{gameDate}</span>
                </div>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Picked:{" "}
                  <span className="font-medium text-cavs-wine dark:text-cavs-gold">
                    {pickedTeam}
                  </span>
                  {" "}({game.spread > 0 ? "+" : ""}{game.spread})
                  {hasScore && (
                    <span className="ml-2 text-zinc-400">
                      Final: {game.finalHomeScore}-{game.finalAwayScore}
                    </span>
                  )}
                </p>
              </div>
              <span
                className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
              >
                {cfg.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
