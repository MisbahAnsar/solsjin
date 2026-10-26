import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SolanaProvider } from "@/components/providers/solana-provider";
import { themeScript } from "@/components/providers/theme";
import { SITE_URL } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Solsjin UI · Solana components that work",
  description: "A modern, animated, accessible, developer-first UI library for Solana: wallets, balances, swaps, transactions and more.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-bg font-inter text-fg antialiased">
        <SolanaProvider>{children}</SolanaProvider>
        <Analytics />
      </body>
    </html>
  );
}
