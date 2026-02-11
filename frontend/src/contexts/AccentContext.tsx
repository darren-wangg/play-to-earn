"use client";

import { createContext, useContext, useEffect, useState } from "react";

export interface JerseyPreset {
  id: string;
  name: string;
  description: string;
  wine: string;
  wineLight: string;
  swatch: string[];
}

export const JERSEYS: JerseyPreset[] = [
  {
    id: "wine",
    name: "Wine",
    description: "Classic home jersey",
    wine: "#860038",
    wineLight: "#a8004a",
    swatch: ["#860038", "#FDBB30", "#041E42"],
  },
  {
    id: "navy",
    name: "Navy",
    description: "Away jersey",
    wine: "#041E42",
    wineLight: "#0a3060",
    swatch: ["#041E42", "#860038", "#FDBB30"],
  },
  {
    id: "gold",
    name: "Gold",
    description: "City Edition",
    wine: "#FDBB30",
    wineLight: "#fdc94d",
    swatch: ["#FDBB30", "#860038", "#041E42"],
  },
  {
    id: "black",
    name: "Black",
    description: "Statement Edition",
    wine: "#1a1a1a",
    wineLight: "#333333",
    swatch: ["#1a1a1a", "#860038", "#FDBB30"],
  },
];

interface AccentContextValue {
  accentIndex: number;
  accent: JerseyPreset;
  setAccentIndex: (i: number) => void;
  cycleAccent: (direction?: 1 | -1) => void;
}

const AccentContext = createContext<AccentContextValue>({
  accentIndex: 0,
  accent: JERSEYS[0],
  setAccentIndex: () => {},
  cycleAccent: () => {},
});

export function useAccent() {
  return useContext(AccentContext);
}

function applyAccent(index: number) {
  const preset = JERSEYS[index];
  document.documentElement.style.setProperty("--cavs-wine", preset.wine);
  document.documentElement.style.setProperty("--cavs-wine-light", preset.wineLight);
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("accent");
    if (stored !== null) {
      const i = parseInt(stored, 10);
      if (i >= 0 && i < JERSEYS.length) {
        setIndex(i);
        applyAccent(i);
      }
    }
  }, []);

  const setAccentIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(i, JERSEYS.length - 1));
    setIndex(clamped);
    localStorage.setItem("accent", String(clamped));
    applyAccent(clamped);
  };

  const cycleAccent = (direction: 1 | -1 = 1) => {
    const next = (index + direction + JERSEYS.length) % JERSEYS.length;
    setAccentIndex(next);
  };

  return (
    <AccentContext.Provider
      value={{ accentIndex: index, accent: JERSEYS[index], setAccentIndex, cycleAccent }}
    >
      {children}
    </AccentContext.Provider>
  );
}
