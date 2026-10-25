import type { Metadata } from "next";
import { SolanaShowcase } from "@/components/showcase/solana-showcase";

export const metadata: Metadata = {
  title: "Solana Components | Solsjin UI",
  description: "A composable, wallet-provider-agnostic UI kit for Solana applications.",
};

export default function ComponentsPage() {
  return <SolanaShowcase />;
}
