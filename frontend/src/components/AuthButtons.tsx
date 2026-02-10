"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="hidden text-sm text-zinc-600 dark:text-zinc-400 sm:inline">
          {session.user?.email}
        </span>
        <button
          onClick={() => signOut()}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="rounded-lg bg-cavs-wine px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cavs-wine-light hover:shadow-md active:scale-[0.98] dark:bg-cavs-gold dark:text-cavs-navy dark:hover:bg-amber-400"
    >
      Sign In
    </button>
  );
}
