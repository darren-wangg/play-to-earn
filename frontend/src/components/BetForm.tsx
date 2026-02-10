"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  spread: number;
  startTime: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const CAVALIERS = "Cleveland Cavaliers";

export default function BetForm({
  game,
  onBetPlaced,
}: {
  game: Game | null;
  onBetPlaced?: () => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!session) {
    return (
      <div className="animate-fade-in rounded-xl border border-dashed border-cavs-wine/30 bg-cavs-wine/5 p-6 text-center sm:p-8">
        <svg className="mx-auto mb-3 h-10 w-10 text-cavs-wine/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-sm font-medium text-cavs-wine/70 dark:text-cavs-gold/70">
          Sign in to place your bet
        </p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="animate-fade-in rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No game available for betting
        </p>
      </div>
    );
  }

  const opponent =
    game.homeTeam === CAVALIERS ? game.awayTeam : game.homeTeam;
  const spreadStr = game.spread > 0 ? `+${game.spread}` : `${game.spread}`;

  const handleBet = async (selection: "cavaliers" | "opponent") => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${BACKEND}/bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ gameId: game.gameId, selection }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to place bet");
      }

      setSuccess(
        `Bet placed on ${selection === "cavaliers" ? "Cavaliers" : opponent}!`
      );
      onBetPlaced?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Pick the spread winner
        </h3>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          Cavaliers spread: {spreadStr} &mdash; Win = +100 points
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 sm:gap-4">
        <button
          onClick={() => handleBet("cavaliers")}
          disabled={loading}
          className="group relative overflow-hidden rounded-lg border-2 border-cavs-wine bg-cavs-wine/5 px-4 py-5 font-semibold text-cavs-wine transition-all hover:bg-cavs-wine hover:text-white hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-cavs-gold dark:bg-cavs-gold/5 dark:text-cavs-gold dark:hover:bg-cavs-gold dark:hover:text-cavs-navy sm:py-6"
        >
          <span className="relative z-10 block text-base sm:text-lg">Cavaliers</span>
          <span className="relative z-10 mt-1 block text-xs opacity-70">
            ({spreadStr})
          </span>
        </button>
        <button
          onClick={() => handleBet("opponent")}
          disabled={loading}
          className="group relative overflow-hidden rounded-lg border-2 border-cavs-navy bg-cavs-navy/5 px-4 py-5 font-semibold text-cavs-navy transition-all hover:bg-cavs-navy hover:text-white hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-400 dark:bg-zinc-400/5 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:hover:text-white sm:py-6"
        >
          <span className="relative z-10 block text-base sm:text-lg">{opponent}</span>
          <span className="relative z-10 mt-1 block text-xs opacity-70">
            ({game.spread > 0 ? `-${Math.abs(game.spread)}` : `+${Math.abs(game.spread)}`})
          </span>
        </button>
      </div>

      {/* Feedback */}
      {loading && (
        <div className="border-t border-zinc-100 px-6 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Placing bet...
          </div>
        </div>
      )}
      {error && (
        <div className="animate-fade-in border-t border-red-100 bg-red-50 px-6 py-3 dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="animate-fade-in border-t border-green-100 bg-green-50 px-6 py-3 dark:border-green-900/30 dark:bg-green-900/10">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            {success}
          </p>
        </div>
      )}
    </div>
  );
}
