"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function PointsCard({ refreshKey }: { refreshKey: number }) {
  const { data: session } = useSession();
  const [points, setPoints] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.accessToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`${BACKEND}/auth/me`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    })
      .then((r) => r.json())
      .then((data) => setPoints(data.points ?? 0))
      .catch(() => setPoints(0))
      .finally(() => setLoading(false));
  }, [session?.accessToken, refreshKey]);

  if (!session) {
    return (
      <div className="animate-fade-in rounded-xl border border-dashed border-cavs-wine/25 bg-cavs-wine/5 p-6 text-center dark:border-cavs-wine/30 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to track your points
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="mt-3 h-3 w-48 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in rounded-xl border border-cavs-wine/20 bg-white p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 dark:border-cavs-wine/30 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Your Points
          </p>
          <p className="mt-1 text-3xl font-bold text-cavs-wine dark:text-cavs-gold">
            {points?.toLocaleString() ?? 0}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cavs-wine/10 dark:bg-cavs-gold/10">
          <svg className="h-6 w-6 text-cavs-wine dark:text-cavs-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
        Earn 100 points for each winning bet
      </p>
    </div>
  );
}
