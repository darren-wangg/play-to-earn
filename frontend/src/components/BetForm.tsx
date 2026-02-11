"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  spread: number;
  startTime: string;
}

interface ExistingBet {
  _id: string;
  gameId: { gameId: string };
  selection: string;
  status: string;
}

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const CAVALIERS = "Cleveland Cavaliers";

export default function BetForm({
  game,
  onBetPlaced,
  refreshKey,
}: {
  game: Game | null;
  onBetPlaced?: () => void;
  refreshKey?: number;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [existingBet, setExistingBet] = useState<ExistingBet | null>(null);

  // Check if user already has a bet on this game
  useEffect(() => {
    if (!session?.accessToken || !game?.gameId) {
      setExistingBet(null);
      return;
    }

    fetch(`${BACKEND}/bets`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((bets: ExistingBet[]) => {
        if (!Array.isArray(bets)) return;
        const match = bets.find((b) => b.gameId?.gameId === game.gameId);
        setExistingBet(match ?? null);
      })
      .catch(() => setExistingBet(null));
  }, [session?.accessToken, game?.gameId, refreshKey]);

  if (!session) {
    return (
      <div className="animate-fade-in rounded-xl border-2 border-dashed border-cavs-wine/30 bg-cavs-wine/5 p-6 text-center sm:p-8">
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
  const oppSpread = -game.spread;
  const oppSpreadStr = oppSpread > 0 ? `+${oppSpread}` : `${oppSpread}`;

  // Already bet on this game
  if (existingBet) {
    const pickedLabel =
      existingBet.selection === "cavaliers" ? "Cavaliers" : opponent;
    return (
      <div className="animate-fade-in rounded-xl border border-cavs-wine/20 bg-white dark:border-cavs-wine/30 dark:bg-zinc-900">
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Bet placed on {pickedLabel}
            </p>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Cavaliers spread: {spreadStr} &mdash; Status: {existingBet.status}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleBet = async (selection: "cavaliers" | "opponent") => {
    setLoading(true);

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

      toast.success(
        `Bet placed on ${selection === "cavaliers" ? "Cavaliers" : opponent}!`
      );
      onBetPlaced?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in rounded-xl border border-cavs-wine/20 bg-white dark:border-cavs-wine/30 dark:bg-zinc-900">
      <div className="border-b border-cavs-wine/10 px-6 py-4 dark:border-cavs-wine/20">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cavs-wine dark:text-cavs-gold">
            Pick the spread winner
          </h3>
          <div className="group relative">
            <div className="flex h-4 w-4 cursor-help items-center justify-center rounded-full border border-zinc-300 text-[10px] font-bold text-zinc-400 dark:border-zinc-600 dark:text-zinc-500">
              i
            </div>
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-64 -translate-x-1/2 rounded-lg bg-zinc-900 px-3 py-2.5 text-xs text-zinc-100 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
              <p className="font-semibold">Win = +100 points</p>
              <p className="mt-1.5 leading-relaxed text-zinc-300 dark:text-zinc-400">
                The point spread levels the playing field.
                {game.spread < 0
                  ? ` CLE (${spreadStr}) is favored — they must win by more than ${Math.abs(game.spread)} pts to cover.`
                  : ` CLE (${spreadStr}) is the underdog — they cover if they lose by fewer than ${Math.abs(game.spread)} pts or win outright.`}
              </p>
              <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-700" />
            </div>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          CLE {spreadStr} &middot; {opponent} {oppSpreadStr}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 p-6 sm:gap-4">
        <button
          onClick={() => handleBet("cavaliers")}
          disabled={loading}
          className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-cavs-wine bg-cavs-wine/5 px-4 py-5 font-semibold text-cavs-wine transition-all duration-200 hover:bg-cavs-wine hover:text-white hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-cavs-gold dark:bg-cavs-gold/5 dark:text-cavs-gold dark:hover:bg-cavs-gold dark:hover:text-cavs-navy sm:py-6"
        >
          <span className="relative z-10 block text-base sm:text-lg">Cavaliers</span>
          <span className="relative z-10 mt-1 block text-xs opacity-70">
            ({spreadStr})
          </span>
        </button>
        <button
          onClick={() => handleBet("opponent")}
          disabled={loading}
          className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-cavs-navy bg-cavs-navy/5 px-4 py-5 font-semibold text-cavs-navy transition-all duration-200 hover:bg-cavs-navy hover:text-white hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 dark:border-zinc-400 dark:bg-zinc-400/5 dark:text-zinc-300 dark:hover:bg-zinc-600 dark:hover:text-white sm:py-6"
        >
          <span className="relative z-10 block text-base sm:text-lg">{opponent}</span>
          <span className="relative z-10 mt-1 block text-xs opacity-70">
            ({oppSpreadStr})
          </span>
        </button>
      </div>

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
    </div>
  );
}
