import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uptop Rain - Play to Earn",
  description: "Bet on Cleveland Cavaliers NBA game point spreads and earn points",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
