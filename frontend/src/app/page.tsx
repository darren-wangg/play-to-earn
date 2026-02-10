"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import AuthButtons from "@/components/AuthButtons";
import GameCard from "@/components/GameCard";
import BetForm from "@/components/BetForm";
import BetList from "@/components/BetList";

interface Game {
  _id: string;
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  spread: number;
  startTime: string;
  status: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [game, setGame] = useState<Game | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleGameLoaded = useCallback((g: Game | null) => {
    setGame(g);
  }, []);

  const handleBetPlaced = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cavs-wine text-sm font-bold text-white shadow-sm sm:h-10 sm:w-10 sm:text-base">
              CLE
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
                Cavaliers
              </h1>
              <p className="hidden text-xs text-zinc-400 sm:block">
                Play-to-Earn
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session && (
              <div className="hidden items-center gap-1.5 rounded-full bg-cavs-gold/20 px-3 py-1 sm:flex">
                <svg className="h-3.5 w-3.5 text-cavs-wine dark:text-cavs-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
                </svg>
                <span className="text-xs font-semibold text-cavs-wine dark:text-cavs-gold">
                  Play to Earn
                </span>
              </div>
            )}
            <AuthButtons />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {/* Next Game */}
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Next Cavaliers Game
          </h2>
          <GameCard onGameLoaded={handleGameLoaded} />
        </section>

        {/* Place Bet */}
        <section className="mb-6 sm:mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Place Your Bet
          </h2>
          <BetForm game={game} onBetPlaced={handleBetPlaced} />
        </section>

        {/* Bet History */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sm:mb-4">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Your Bets
          </h2>
          <BetList refreshKey={refreshKey} />
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="text-xs text-zinc-400">
              Uptop Rain &mdash; Cleveland Cavaliers Play-to-Earn
            </p>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-cavs-wine via-cavs-gold to-cavs-navy" />
          </div>
        </div>
      </footer>
    </div>
  );
}
