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

## Coming soon & launch

While `COMING_SOON` is on (the default when it's unset), solsjin.com shows a single "notify me" page:

- Every page URL (`/`, `/components`, `/components/*`, anything else) is **rewritten** to `app/coming-soon`. The URL stays the same and no page is deleted. `robots.txt` only allows `/`.
- Every API except `/api/waitlist*` and `/api/admin/*` returns `404`.
- Static files (`/_next/*`, fonts, images, `favicon.ico`, `icon.svg`, `robots.txt`, the OG image) and Vercel Analytics (`/_vercel/*`) still load.
- The gate is a set of build-time rewrites in `next.config.ts` (served from Vercel's CDN, no function runs per view), so changing `COMING_SOON` needs a redeploy. `proxy.ts` only runs on `?preview=` URLs.
- To see the full site while it's gated, set `PREVIEW_SECRET` and visit `https://solsjin.com/?preview=<PREVIEW_SECRET>`. That sets a 30-day cookie; `/?preview=off` removes it.

Signups go to Postgres through `POST /api/waitlist`:

- Emails are normalised and validated on the server, and duplicates are reported as "already on the list".
- Bot protection: honeypot field, a signed form token (fetched when you focus the form; submissions faster than 1.5s are rejected), same-origin + JSON-only + 2 KB body limit, disposable-domain block. Limits are stored in Postgres (`rate_limits`): 5/min and 20/day per IP, 60/min across everyone. See [Security](#security).
- The schema is in `db/migrations/001_waitlist.sql`. It runs automatically (`create table if not exists`) on the first request, so you don't need to run a migration.
- Without `DATABASE_URL` the API returns `503 not_configured` and logs it. The build works without any env vars.

### Set up (once)

1. **Database**:
   - In Vercel, go to Project → Storage → Create/Connect → **Neon** (or Supabase) and connect it to the project. This adds `DATABASE_URL`.
   - If you use Supabase directly, use the **pooled** connection string (port 6543) as `DATABASE_URL`.
2. **Email**:
   - In [Resend](https://resend.com), add and verify the domain `solsjin.com`: add the DNS records it shows you, then wait until it says *Verified*.
   - Create an API key.
3. **Env vars**: in Vercel → Project → Settings → Environment Variables (Production), set:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | set by the Neon/Supabase integration |
   | `ADMIN_SECRET` | a long random string, 12+ chars, e.g. `openssl rand -base64 32` |
   | `RESEND_API_KEY` | `re_...` |
   | `EMAIL_FROM` | `solsjin <hello@solsjin.com>` (must be on the verified domain) |
   | `PREVIEW_SECRET` | optional, another random string |
   | `COMING_SOON` | optional. Unset or `true` keeps the gate on. |
   | `EMAIL_DAILY_LIMIT` / `EMAIL_MONTHLY_LIMIT` | optional, default `100` / `3000` (Resend free plan) |

   Then redeploy.
4. **Domain**:
   - In Vercel → Project → Settings → Domains, add `solsjin.com` (and `www.solsjin.com`, redirecting to it).
   - Point DNS where Vercel tells you to.

### Launch

1. Open `https://solsjin.com/admin/launch` and sign in with `ADMIN_SECRET`. The page shows the subscriber count and the list, and has a CSV export.
2. Edit the subject and body if you want; the default links to https://solsjin.com. Then use **Send test** to email yourself.
3. Click **Send launch email** and confirm.
   - It sends in batches of 100 through the Resend batch API and marks each person `notified_at`.
   - It stops at `EMAIL_DAILY_LIMIT` (100/day on Resend's free plan) and tells you when to press it again; the next day it carries on with the people still pending.
   - Only people who haven't been emailed get it, so if something fails, click it again. Nobody is emailed twice.
   - Every email has an unsubscribe link and a `List-Unsubscribe` header.
4. Set `COMING_SOON=false` in Vercel and redeploy. The full site is live, and `/coming-soon` now redirects to `/`.

## Security

Built to keep a Vercel Hobby + Neon free + Resend free setup inside its quotas.

**App** (`lib/server/guard.ts`, `lib/server/rate-limit.ts`):

| Endpoint | Limits |
| --- | --- |
| `POST /api/waitlist` | 8/min per IP in memory, then Postgres: 5/min + 20/day per IP, 60/min global. Honeypot, form token, same-origin, JSON, 2 KB. |
| `GET /api/waitlist/token` | 20/min per IP, rejects cross-site |
| `POST /api/admin/login` | 5 per 10 min + 20/day per IP, 50/hour global, 400 ms delay on a wrong password |
| `POST /api/admin/send` | same-origin, needs `confirm: "launch"`, one send at a time (90 s lease), test sends 10/hour, daily/monthly email caps |
| `/api/waitlist/unsubscribe` | 20/min per IP |

Every limit answers `429` with `Retry-After`. Admin sessions last 8 hours (httpOnly, `SameSite=Strict`, secure). `next.config.ts` sets CSP, HSTS (preload), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and COOP/CORP. Image optimization is off and fonts are cached for a year.

**Vercel Firewall** (Project → Firewall; free on Hobby):

- *Block scanner paths*: deny any `.php`, `/wp-*`, `/xmlrpc`, `/phpmyadmin`, `/cgi-bin`, `/.env`, `/.git`, `/.aws`, `/.ssh`, `/vendor/`, `/actuator`, `.sql`/`.bak`/`.log`/`.sh`/`.asp`/`.jsp` and similar.
- *Rate limit API*: 60 requests/min per IP on `/api/*` (fixed window, deny).
- Managed rules: **AI bots** = deny, **Bot protection** = log. (Challenging bots would also block one-click unsubscribe from mail providers.)
- Emergency switch: if you're under attack, turn on **Attack Challenge Mode** in Firewall, then turn it off afterwards. It's not left on, because it challenges every visitor.

## Components

There are 28 components across the Wallet, Network, Balances, Assets, Transactions, Motion and Primitives categories. See `/components` or `lib/registry.ts` for props, examples and accessibility notes.
