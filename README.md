# Solsjin UI

Composable UI components for Solana applications, built with React, TypeScript, and Tailwind CSS. The component showcase lives at `/components`.

## Start the app

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) for the launch page and [http://localhost:3000/components](http://localhost:3000/components) for the component showcase.

## Components

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  AddressDisplay,
  ClusterBadge,
  ClusterSelector,
  SolBalance,
  TokenAmountInput,
  TransactionStatus,
  WalletConnectButton,
} from "@/components/solana";
```

### Connect a wallet

`WalletConnectButton` is controlled by the host app. It does not discover wallets, store keys, or sign transactions. Connect its callbacks to your wallet provider so your application remains in charge of user approval and signing.

```tsx
const walletButtonProps = wallet
  ? { state: "connected" as const, wallet, onDisconnect: disconnect }
  : { state: "disconnected" as const, onConnect: openWalletPicker };

<WalletConnectButton {...walletButtonProps} />
```

The prop type requires an address when the state is connected and requires an `onConnect` callback while disconnected or connecting. This keeps invalid visual states out of the component API.

For new Solana applications, follow the current [Solana Kit and Wallet Standard guide](https://solana.com/docs/frontend/nextjs-solana). The Solana team recommends Wallet Standard discovery for current wallets; the UI components deliberately avoid coupling the project to a specific provider. Existing apps can connect the same callbacks to their current wallet adapter.

### Show transaction status

```tsx
<TransactionStatus
  cluster="devnet"
  signature={signature}
  state="confirmed"
/>
```

Explorer links use the signature and selected cluster provided by the app. Do not pass placeholder or unverified signatures.

## Component reference

| Component | Purpose |
| --- | --- |
| `Button`, `Badge`, `Card`, `Input`, `Label`, `Separator` | Shared interface primitives with composable Tailwind classes |
| `WalletConnectButton` | Disconnected, connecting, and connected wallet states |
| `AddressDisplay` | Shortened public key with a copy action |
| `ClusterBadge` | Mainnet, Devnet, Testnet, and Localnet indicator |
| `ClusterSelector` | Controlled cluster switcher with accessible selected-state buttons |
| `SolBalance` | Native SOL balance presentation |
| `TokenAmountInput` | Controlled decimal amount field with asset and balance context |
| `TransactionStatus` | Processing, confirmed, and failed states with optional Explorer link |

The showcase uses sample display data and local preview interactions. Its previews do not connect to a wallet or submit transactions.
