# solsjin

Solana UI components for React and Next.js: wallets, balances, transfers, swaps, NFTs and motion primitives. They all run on real RPC data. The docs and live previews are at `/components`.

Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, `@solana/web3.js` 1.x, `@solana/wallet-adapter`, Motion and Phosphor icons.

## Setup

Requirements: [Bun](https://bun.sh) 1.2 or newer (npm/pnpm also work) and Node 20 or newer.

```bash
git clone https://github.com/MisbahAnsar/solsjin.git
cd solsjin
bun install
cp .env.example .env.local   # optional: every value has a public default
bun run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `bun run dev` | Dev server with Turbopack |
| `bun run build` | Production build |
| `bun run start` | Serve the production build (`-p 3100` to change port) |
| `bun run lint` | ESLint (including the React Compiler rules) |
| `npx tsc --noEmit` | Type-check |

### Environment

All configuration is read in one place, `lib/solana/config.ts`. The providers, hooks and swap widget all read from it.

| Variable | Default | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SOLANA_RPC_MAINNET` | `https://api.mainnet-beta.solana.com` | Mainnet RPC |
| `NEXT_PUBLIC_SOLANA_RPC_DEVNET` | `https://api.devnet.solana.com` | Devnet RPC (default cluster) |
| `NEXT_PUBLIC_SOLANA_RPC_TESTNET` | `https://api.testnet.solana.com` | Testnet RPC |
| `NEXT_PUBLIC_SOLANA_RPC_LOCALNET` | `http://127.0.0.1:8899` | `solana-test-validator` |
| `NEXT_PUBLIC_JUPITER_API_URL` | `https://api.jup.ag` | Jupiter swap quotes and prices |
| `NEXT_PUBLIC_JUPITER_API_KEY` | none | Optional key sent as `x-api-key` (keyless use is rate limited) |

These values are `NEXT_PUBLIC_*`, so they ship to the browser and are fixed at build time. Restart `dev` or rebuild after you change them. Public RPCs are heavily rate limited, so use a provider such as Helius, Triton or QuickNode in production. An RPC that supports the DAS API also gives `<NftGallery />` full metadata, including compressed NFTs.

### Polyfills

You don't need any. `@solana/web3.js` 1.x bundles its own `buffer`, and every Solana component is a client component, so Turbopack builds work without `Buffer` shims or webpack fallbacks.

## Usage

Wrap the app once. `SolanaProvider` sets up the cluster (saved in `localStorage`), the connection, the wallet adapter (Wallet Standard auto-detection with autoConnect), the wallet modal and toasts.

```tsx
// app/layout.tsx
import { SolanaProvider } from "@/components/providers/solana-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
```

```tsx
"use client";
import { ConnectWallet, ClusterSelector, SolBalance, SendSolForm, SignMessage, SwapWidget } from "@/components/solana";

export function Wallet() {
  return (
    <>
      <ConnectWallet />
      <ClusterSelector />
      <SolBalance />
      <SendSolForm onSent={(signature) => console.log(signature)} />
      <SignMessage />
      <SwapWidget /> {/* mainnet only */}
    </>
  );
}
```

Hooks: `useSolBalance`, `useTokenBalances` (SPL Token and Token-2022), `useTokenPrices`, `useWalletAssets` (DAS with a token-account fallback), `useSendTransaction` (sign, send, confirm and toast) and `useCluster`.

### Network notes

- **Wallets.** Phantom, Solflare, Backpack and any other Wallet Standard wallet show up automatically. If none is installed, the modal links to downloads.
- **Airdrop.** Works on devnet, testnet and localnet. Public faucets rate-limit hard, so the button explains a 429 and links to faucet.solana.com.
- **Send SOL.** Builds a System transfer with a fresh blockhash and confirms it against that blockhash. It checks the address, the amount and your balance with the fee kept aside, and refuses to create an account below the rent-exempt minimum.
- **Swap.** Uses Jupiter `swap/v1`, which is mainnet only. On other clusters the widget still shows quotes but asks you to switch to mainnet before executing.
- **Sign message.** Verifies locally with tweetnacl (ed25519). Always verify again on your server.

## Components

There are 28 components across the Wallet, Network, Balances, Assets, Transactions, Motion and Primitives categories. See `/components` or `lib/registry.ts` for props, examples and accessibility notes.
