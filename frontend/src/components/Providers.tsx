"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccentProvider } from "@/contexts/AccentContext";
import { Toaster } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AccentProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AccentProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
