"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

interface GameResponse {
  gameId?: string;
  homeTeam?: string;
  awayTeam?: string;
  startTime?: string;
  spread?: number;
  status?: string;
  message?: string;
}

interface SettleResponse {
  gameId?: string;
  adjustedMargin?: number;
  settled?: { total: number; won: number; lost: number; push: number };
  message?: string;
}

function HealthDetails({ health }: { health: Record<string, unknown> }) {
  // Terminus puts healthy checks in `details`, failed ones in `error`
  const allDetails = {
    ...((health.details ?? {}) as Record<string, { status?: string; message?: string }>),
    ...((typeof health.error === "object" && health.error !== null ? health.error : {}) as Record<string, { status?: string; message?: string }>),
  };
  const entries = Object.entries(allDetails);

  if (entries.length === 0 && health.status !== "ok") {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {health.message ? String(health.message) : "Unknown error — check backend logs"}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([name, detail]) => {
        const isUp = detail?.status === "up";
        return (
          <div
            key={name}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              isUp
                ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`} />
            <span>{name}</span>
            {!isUp && detail?.message && (
              <span className="text-xs opacity-70">— {detail.message}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AdminPage() {
  const [apiKey, setApiKey] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchResult, setFetchResult] = useState<GameResponse | null>(null);

  const [settleGameId, setSettleGameId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleResult, setSettleResult] = useState<SettleResponse | null>(null);

  const [currentGame, setCurrentGame] = useState<GameResponse | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND}/health`)
      .then((r) => r.json().catch(() => ({ status: "error", error: `HTTP ${r.status}` })))
      .then(setHealth)
      .catch(() => setHealth({ status: "error", error: "Backend unreachable" }))
      .finally(() => setHealthLoading(false));
  }, []);

  const handleFetchGame = async () => {
    if (!apiKey.trim()) {
      toast.error("Enter your admin API key");
      return;
    }
    setFetchLoading(true);
    setFetchResult(null);
    try {
      const res = await fetch(`${BACKEND}/games/next`, {
        method: "POST",
        headers: { "x-admin-api-key": apiKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch game");
      setFetchResult(data);
      if (data.gameId) setSettleGameId(data.gameId);
      toast.success("Game fetched from Odds API");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast.error(msg);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleViewCurrent = async () => {
    setViewLoading(true);
    try {
      const res = await fetch(`${BACKEND}/games/next`);
      const data = await res.json();
      setCurrentGame(data);
      if (data.gameId) setSettleGameId(data.gameId);
    } catch {
      toast.error("Failed to fetch current game");
    } finally {
      setViewLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!apiKey.trim()) {
      toast.error("Enter your admin API key");
      return;
    }
    if (!settleGameId.trim()) {
      toast.error("Enter a game ID");
      return;
    }
    if (!homeScore || !awayScore) {
      toast.error("Enter both scores");
      return;
    }
    setSettleLoading(true);
    setSettleResult(null);
    try {
      const res = await fetch(`${BACKEND}/games/${settleGameId}/settle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-api-key": apiKey,
        },
        body: JSON.stringify({
          finalHomeScore: Number(homeScore),
          finalAwayScore: Number(awayScore),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Settlement failed");
      setSettleResult(data);
      toast.success("Game settled successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast.error(msg);
    } finally {
      setSettleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="w-full border-b border-red-500/30 bg-white dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Admin Panel
            </h1>
            <p className="text-xs text-zinc-400">Manage games &amp; settlement</p>
          </div>
          <a
            href="/"
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to App
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {/* System Health */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            System Health
          </h2>
          {healthLoading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              Checking...
            </div>
          ) : health ? (
            <div className="mt-3 space-y-3">
              {/* Overall status */}
              <div className={`flex items-center gap-2 text-sm font-semibold ${
                health.status === "ok"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              }`}>
                <span className={`h-2.5 w-2.5 rounded-full ${
                  health.status === "ok" ? "bg-green-500" : "bg-red-500"
                }`} />
                {health.status === "ok" ? "All systems operational" : "Service degraded"}
              </div>

              {/* Per-service details */}
              <HealthDetails health={health} />
            </div>
          ) : null}
        </div>

        {/* API Key */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Admin API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your ADMIN_API_KEY"
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cavs-wine focus:outline-none focus:ring-1 focus:ring-cavs-wine dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-cavs-gold dark:focus:ring-cavs-gold"
          />
        </div>

        {/* View Current Game */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Current Game
          </h2>
          <p className="mt-1 text-xs text-zinc-400">View the current next game in the database (public endpoint).</p>
          <button
            onClick={handleViewCurrent}
            disabled={viewLoading}
            className="mt-3 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600 disabled:opacity-50 dark:bg-zinc-600 dark:hover:bg-zinc-500"
          >
            {viewLoading ? "Loading..." : "View Current Game"}
          </button>
          {currentGame && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {JSON.stringify(currentGame, null, 2)}
            </pre>
          )}
        </div>

        {/* Fetch Game from Odds API */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Fetch Game from Odds API
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Pull the next Cavaliers game from The Odds API and store it.
          </p>
          <button
            onClick={handleFetchGame}
            disabled={fetchLoading || !apiKey}
            className="mt-3 rounded-lg bg-cavs-wine px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-cavs-wine-light disabled:opacity-50 dark:bg-cavs-gold dark:text-cavs-navy dark:hover:bg-amber-400"
          >
            {fetchLoading ? "Fetching..." : "Fetch Next Game"}
          </button>
          {fetchResult && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {JSON.stringify(fetchResult, null, 2)}
            </pre>
          )}
        </div>

        {/* Settle Game */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Settle Game
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Submit final scores to settle all pending bets.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                Game ID
              </label>
              <input
                type="text"
                value={settleGameId}
                onChange={(e) => setSettleGameId(e.target.value)}
                placeholder="e.g., abc123def456"
                className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cavs-wine focus:outline-none focus:ring-1 focus:ring-cavs-wine dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-cavs-gold dark:focus:ring-cavs-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Home Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="110"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cavs-wine focus:outline-none focus:ring-1 focus:ring-cavs-wine dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-cavs-gold dark:focus:ring-cavs-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Away Score
                </label>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="105"
                  className="mt-1 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-cavs-wine focus:outline-none focus:ring-1 focus:ring-cavs-wine dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-cavs-gold dark:focus:ring-cavs-gold"
                />
              </div>
            </div>
            <button
              onClick={handleSettle}
              disabled={settleLoading || !apiKey || !settleGameId || !homeScore || !awayScore}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
            >
              {settleLoading ? "Settling..." : "Settle Game"}
            </button>
          </div>
          {settleResult && (
            <pre className="mt-3 overflow-x-auto rounded-lg bg-zinc-50 p-3 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {JSON.stringify(settleResult, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
