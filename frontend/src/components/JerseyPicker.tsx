"use client";

import { useEffect, useRef, useState } from "react";
import { useAccent, JERSEYS } from "@/contexts/AccentContext";

export default function JerseyPicker() {
  const { accentIndex, setAccentIndex, cycleAccent } = useAccent();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Keyboard navigation when popover is open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        cycleAccent(1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        cycleAccent(-1);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, cycleAccent]);

  const current = JERSEYS[accentIndex];

  return (
    <div ref={containerRef} className="relative">
      {/* CLE button */}
      <button
        onClick={() => setOpen(!open)}
        title={`Jersey: ${current.name}`}
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-cavs-wine text-sm font-bold text-white shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95 sm:h-10 sm:w-10 sm:text-base"
      >
        CLE
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-cavs-wine/20 bg-white shadow-xl dark:border-cavs-wine/30 dark:bg-zinc-800">
          {/* Header */}
          <div className="border-b border-zinc-100 px-3 py-2 dark:border-zinc-700">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Jersey Theme
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                Arrow keys to navigate
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="p-1.5">
            {JERSEYS.map((jersey, i) => (
              <button
                key={jersey.id}
                onClick={() => {
                  setAccentIndex(i);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === accentIndex
                    ? "bg-zinc-100 dark:bg-zinc-700"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                }`}
              >
                {/* Color swatches */}
                <div className="flex -space-x-1">
                  {jersey.swatch.map((color, ci) => (
                    <div
                      key={ci}
                      className="h-6 w-6 rounded-full border-2 border-white shadow-sm dark:border-zinc-800"
                      style={{ backgroundColor: color, zIndex: 3 - ci }}
                    />
                  ))}
                </div>

                {/* Label */}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {jersey.name}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {jersey.description}
                  </div>
                </div>

                {/* Active indicator */}
                {i === accentIndex && (
                  <svg className="h-4 w-4 shrink-0 text-cavs-wine dark:text-cavs-gold" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
