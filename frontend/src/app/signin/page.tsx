"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn("credentials", { email, callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      {/* Logo / Brand */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cavs-wine text-2xl font-bold text-white shadow-lg">
          UR
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Uptop Rain
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Cavaliers Play-to-Earn Betting
          </p>
        </div>
      </div>

      {/* Sign In Card */}
      <form
        onSubmit={handleSubmit}
        className="animate-fade-in w-full max-w-sm overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-cavs-wine via-cavs-gold to-cavs-navy" />

        <div className="p-6 sm:p-8">
          <h2 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Sign in to your account
          </h2>
          <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your email to start betting
          </p>

          <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mb-5 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-cavs-wine focus:bg-white focus:ring-2 focus:ring-cavs-wine/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-cavs-gold dark:focus:ring-cavs-gold/20"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-cavs-wine py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-cavs-wine-light hover:shadow-md active:scale-[0.98] dark:bg-cavs-gold dark:text-cavs-navy dark:hover:bg-amber-400"
          >
            Continue
          </button>
        </div>
      </form>

      {/* Footer hint */}
      <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        No password needed &mdash; just your email
      </p>
    </div>
  );
}
