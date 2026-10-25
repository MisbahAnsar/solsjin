import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solsjin UI — Built for Solana",
  description: "A modern, animated, developer-first UI library for Solana.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html className="min-h-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" lang="en">
      <body className="m-0 min-h-screen overflow-x-hidden bg-paper font-inter text-ink antialiased [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_a]:[-webkit-tap-highlight-color:transparent] [&_button]:[-webkit-tap-highlight-color:transparent] [&_input]:font-[inherit] [&_button]:font-[inherit]">{children}</body>
    </html>
  );
}
