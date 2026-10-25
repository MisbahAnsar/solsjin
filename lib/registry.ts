export type Category = "Wallet" | "Network" | "Assets" | "Transactions" | "Motion" | "Primitives";

export type PropDoc = { name: string; type: string; default?: string; description: string; required?: boolean };
export type Example = { id: string; title: string; description?: string; code: string };

export type RegistryEntry = {
  slug: string;
  name: string;
  category: Category;
  description: string;
  /** Short line for cards and search results. */
  summary: string;
  keywords: string[];
  files: string[];
  deps?: string[];
  /** Needs <SolanaProvider> (wallet / connection / cluster context). */
  provider?: boolean;
  live?: boolean;
  isNew?: boolean;
  examples: Example[];
  props: PropDoc[];
  a11y: string[];
  notes?: string[];
};

export const CATEGORIES: { name: Category; description: string }[] = [
  { name: "Wallet", description: "Connect, identify and display wallets." },
  { name: "Network", description: "Clusters, RPC health and network context." },
  { name: "Assets", description: "Balances, tokens, amounts and collectibles." },
  { name: "Transactions", description: "Send, swap, airdrop and track signatures." },
  { name: "Motion", description: "Gooey, physics-based building blocks." },
  { name: "Primitives", description: "The base layer every component is made from." },
];

const className: PropDoc = { name: "className", type: "string", description: "Extra classes merged with tailwind-merge." };

export const REGISTRY: RegistryEntry[] = [
  // ---------------------------------------------------------------- Wallet
  {
    slug: "connect-wallet",
    name: "Connect Wallet",
    category: "Wallet",
    summary: "One-line wallet connection with a gooey account menu.",
    description:
      "Drop-in connect button wired to Wallet Standard via wallet-adapter. Disconnected it opens the wallet modal; connected it morphs into an account pill whose actions drip out as gooey droplets: copy, explorer, change wallet and disconnect.",
    keywords: ["wallet", "connect", "phantom", "solflare", "backpack", "login", "account", "gooey"],
    files: ["components/solana/connect-wallet.tsx", "components/solana/wallet-modal.tsx", "components/solana/wallet-avatar.tsx"],
    deps: ["@solana/wallet-adapter-react", "@solana/web3.js", "motion", "@phosphor-icons/react"],
    provider: true,
    live: true,
    isNew: true,
    examples: [
      { id: "default", title: "Live", description: "Connects to any installed Wallet Standard wallet.", code: `import { ConnectWallet } from "@/components/solana";\n\nexport function Header() {\n  return <ConnectWallet />;\n}` },
      { id: "variants", title: "Variants", description: "Every Button variant and size is supported.", code: `<ConnectWallet variant="accent" size="lg" label="Launch app" />\n<ConnectWallet variant="outline" size="sm" />` },
      { id: "menu", title: "Account menu", description: "The connected state on its own, with a demo address.", code: `import { ConnectedPill } from "@/components/solana";\n\n<ConnectedPill\n  address="7xKX…eT8y"\n  name="Phantom"\n  onChange={openModal}\n  onDisconnect={disconnect}\n/>` },
    ],
    props: [
      { name: "label", type: "string", default: '"Connect wallet"', description: "Text for the disconnected state." },
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "accent"', default: '"primary"', description: "Button style when disconnected." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Button size when disconnected." },
      className,
    ],
    a11y: [
      "The account pill is a menu button (aria-haspopup, aria-expanded) and its droplets are menuitems with a roving tabindex.",
      "Arrow keys, Home and End move between actions; Escape closes and returns focus to the pill.",
      "Droplet motion is skipped when prefers-reduced-motion is set.",
    ],
  },
  {
    slug: "wallet-modal",
    name: "Wallet Modal",
    category: "Wallet",
    summary: "Wallet picker with detection, install links and empty state.",
    description:
      "A focus-trapped dialog that lists Wallet Standard wallets detected in the browser, shows connection progress per wallet and falls back to install links when no wallet extension exists.",
    keywords: ["wallet", "modal", "picker", "select", "install", "dialog"],
    files: ["components/solana/wallet-modal.tsx", "components/ui/dialog.tsx"],
    deps: ["@solana/wallet-adapter-react", "motion"],
    provider: true,
    live: true,
    examples: [
      { id: "default", title: "Open the modal", code: `import { useWalletModal } from "@/components/solana";\n\nexport function Connect() {\n  const { setVisible } = useWalletModal();\n  return <button onClick={() => setVisible(true)}>Choose wallet</button>;\n}` },
      { id: "empty", title: "No wallet installed", description: "What users without an extension see.", code: `// Rendered automatically when no Wallet Standard wallet is detected.\n<WalletModal open onOpenChange={setOpen} />` },
    ],
    props: [
      { name: "open", type: "boolean", required: true, description: "Controlled visibility (when rendering <WalletModal/> yourself)." },
      { name: "onOpenChange", type: "(open: boolean) => void", required: true, description: "Called on close (Esc, backdrop, close button, successful connect)." },
    ],
    a11y: ["Renders role=dialog with aria-modal, labelled by its title.", "Focus is trapped while open and restored to the trigger on close.", "Each wallet row announces its detected / connecting state."],
    notes: ["<SolanaProvider> already mounts the modal. Call useWalletModal().setVisible(true) from anywhere."],
  },
  {
    slug: "wallet-connect-button",
    name: "Wallet Connect Button",
    category: "Wallet",
    summary: "Presentational, fully controlled wallet button.",
    description: "Stateless button for teams that bring their own wallet state (Privy, Dynamic, a custom store). Disconnected, connecting and connected states are a discriminated union, so invalid prop combinations fail to type-check.",
    keywords: ["wallet", "button", "controlled", "presentational"],
    files: ["components/solana/wallet-connect-button.tsx"],
    examples: [
      { id: "default", title: "States", code: `<WalletConnectButton state="disconnected" onConnect={connect} />\n<WalletConnectButton state="connecting" />\n<WalletConnectButton\n  state="connected"\n  wallet={{ name: "Phantom", address }}\n  onDisconnect={disconnect}\n/>` },
    ],
    props: [
      { name: "state", type: '"disconnected" | "connecting" | "connected"', required: true, description: "Which UI to show." },
      { name: "onConnect", type: "() => void | Promise<void>", description: "Required when disconnected." },
      { name: "wallet", type: "{ name: string; address: string }", description: "Required when connected." },
      { name: "onDisconnect", type: "() => void | Promise<void>", description: "Shows a disconnect button when connected." },
      className,
    ],
    a11y: ["The connecting state sets aria-busy and disables the button."],
  },
  {
    slug: "address-display",
    name: "Address Display",
    category: "Wallet",
    summary: "Truncated public key with copy and explorer link.",
    description: "Readable addresses and signatures: middle truncation, monospace digits, a deterministic avatar, one-click copy with feedback and an explorer link that follows the active cluster.",
    keywords: ["address", "public key", "pubkey", "copy", "explorer", "truncate", "signature"],
    files: ["components/solana/address-display.tsx", "components/solana/wallet-avatar.tsx", "components/ui/copy-button.tsx"],
    examples: [
      { id: "default", title: "Default", code: `<AddressDisplay address="7xKXtg2CW87d97TXJSDpbD5jBkheT9h2mVJynYjQeT8y" />` },
      { id: "variants", title: "Variants", code: `<AddressDisplay address={address} variant="pill" avatar explorer />\n<AddressDisplay address={address} chars={8} />\n<AddressDisplay address={address} full />` },
    ],
    props: [
      { name: "address", type: "string", required: true, description: "Base58 address or signature." },
      { name: "chars", type: "number", default: "4", description: "Characters kept on each side." },
      { name: "full", type: "boolean", default: "false", description: "Show the whole value, wrapping." },
      { name: "avatar", type: "boolean", default: "false", description: "Prefix a gradient avatar." },
      { name: "copyable", type: "boolean", default: "true", description: "Show the copy button." },
      { name: "explorer", type: "boolean", default: "false", description: "Show a Solana Explorer link." },
      { name: "cluster", type: "SolanaCluster", description: "Explorer cluster. Defaults to the provider cluster." },
      { name: "kind", type: '"address" | "tx"', default: '"address"', description: "Explorer route." },
      { name: "variant", type: '"plain" | "pill"', default: '"plain"', description: "Visual style." },
      className,
    ],
    a11y: ["The full value is in the title attribute and the copy button label.", "Copy success is announced through a polite live region."],
  },
  {
    slug: "wallet-avatar",
    name: "Wallet Avatar",
    category: "Wallet",
    summary: "Round profile picture for a connected wallet.",
    description: "A round profile picture rendered with next/image: object-cover, rounded-full and a subtle ring. Pass `src` to use any image; it defaults to /avatar.jpg.",
    keywords: ["avatar", "pfp", "profile", "image"],
    files: ["components/solana/wallet-avatar.tsx"],
    examples: [{ id: "default", title: "Sizes", code: `<WalletAvatar address={address} size={24} />\n<WalletAvatar address={address} size={40} />\n<WalletAvatar address={address} size={56} />` }],
    props: [
      { name: "address", type: "string", required: true, description: "Wallet address the avatar belongs to." },
      { name: "src", type: "string", default: "\"/avatar.jpg\"", description: "Image URL for the profile picture." },
      { name: "size", type: "number", default: "32", description: "Pixel size." },
      className,
    ],
    a11y: ["Decorative (aria-hidden). Pair it with a visible address."],
  },
  // ---------------------------------------------------------------- Network
  {
    slug: "cluster-selector",
    name: "Cluster Selector",
    category: "Network",
    summary: "Gooey segmented control that switches the RPC endpoint.",
    description: "Pick mainnet, devnet or testnet. Bound to <SolanaProvider>, the choice is persisted to localStorage, synced across tabs and immediately re-points the Connection used by every other component.",
    keywords: ["cluster", "network", "devnet", "mainnet", "testnet", "rpc", "segmented", "gooey"],
    files: ["components/solana/cluster-selector.tsx", "components/motion/gooey-tabs.tsx", "components/providers/cluster.tsx"],
    provider: true,
    live: true,
    examples: [
      { id: "default", title: "Bound to provider", description: "Try it. The badge and balance demos follow along.", code: `<ClusterSelector />` },
      { id: "controlled", title: "Controlled", code: `const [cluster, setCluster] = useState<SolanaCluster>("devnet");\n\n<ClusterSelector value={cluster} onValueChange={setCluster} size="sm" />` },
    ],
    props: [
      { name: "value", type: "SolanaCluster", description: "Controlled value. Omit to use the provider's persisted cluster." },
      { name: "onValueChange", type: "(cluster: SolanaCluster) => void", description: "Change handler." },
      { name: "options", type: "ClusterOption[]", default: "mainnet, devnet, testnet", description: "Which clusters to offer." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Control height." },
      { name: "fill", type: "boolean", default: "false", description: "Stretch to the container width." },
      className,
    ],
    a11y: ["role=radiogroup with aria-checked radios.", "Arrow keys, Home and End move the selection, as in a native radio group."],
  },
  {
    slug: "cluster-badge",
    name: "Cluster Badge",
    category: "Network",
    summary: "Status pill for the active cluster.",
    description: "Colour-coded cluster indicator with a live pulse. Reads the provider cluster when no prop is given.",
    keywords: ["cluster", "badge", "network", "status"],
    files: ["components/solana/cluster-badge.tsx"],
    examples: [{ id: "default", title: "All clusters", code: `<ClusterBadge cluster="mainnet-beta" />\n<ClusterBadge cluster="devnet" />\n<ClusterBadge cluster="testnet" />\n<ClusterBadge /> {/* follows provider */}` }],
    props: [
      { name: "cluster", type: "SolanaCluster", description: "Defaults to the provider cluster." },
      { name: "pulse", type: "boolean", default: "true", description: "Animated live dot." },
      className,
    ],
    a11y: ["Text label always present; colour is never the only signal."],
  },
  {
    slug: "network-status",
    name: "Network Status",
    category: "Network",
    summary: "Live slot height and RPC latency.",
    description: "Polls the active RPC for the current slot and measures round-trip latency, with healthy, slow and unreachable states.",
    keywords: ["rpc", "latency", "slot", "health", "status", "ping"],
    files: ["components/solana/network-status.tsx"],
    provider: true,
    live: true,
    examples: [{ id: "default", title: "Live", code: `<NetworkStatus interval={6000} />` }],
    props: [
      { name: "interval", type: "number", default: "6000", description: "Polling interval in ms." },
      className,
    ],
    a11y: ["Status changes are announced politely."],
  },
  // ---------------------------------------------------------------- Assets
  {
    slug: "sol-balance",
    name: "SOL Balance",
    category: "Assets",
    summary: "Live balance with websocket updates and USD value.",
    description: "Fetches a balance, subscribes to account changes and shows the USD value from Jupiter's price API. Handles loading, error, retry and disconnected states.",
    keywords: ["balance", "sol", "lamports", "usd", "price", "account"],
    files: ["components/solana/sol-balance.tsx", "components/solana/hooks.ts"],
    provider: true,
    live: true,
    examples: [
      { id: "default", title: "Live (connected wallet)", code: `const { publicKey } = useWallet();\n\n<SolBalance address={publicKey} />` },
      { id: "address", title: "Any address", code: `<SolBalance address="vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg" />` },
      { id: "static", title: "Static", code: `<SolBalance amount={128.42} change="+2.4%" />` },
    ],
    props: [
      { name: "address", type: "string | PublicKey | null", description: "Live mode: fetch and subscribe on the active cluster." },
      { name: "amount", type: "string | number", description: "Static mode: render this SOL amount." },
      { name: "change", type: "string", description: 'Optional change label, e.g. "+2.4%".' },
      { name: "label", type: "string", default: '"SOL balance"', description: "Card heading." },
      { name: "showUsd", type: "boolean", default: "true", description: "Show the USD value." },
      className,
    ],
    a11y: ["Loading uses aria-busy skeletons; errors render role=alert with a retry button."],
    notes: ["Hook only? Use useSolBalance(address) for { status, sol, lamports, error, refresh }."],
  },
  {
    slug: "token-amount-input",
    name: "Token Amount Input",
    category: "Assets",
    summary: "Decimal-safe amount field with Max and balance checks.",
    description: "Accepts only valid decimals up to the token's precision, keeps a fee reserve for SOL on Max, flags insufficient balance and shows the USD estimate. Exposes validateAmount() for submit logic, which returns exact base units as bigint.",
    keywords: ["amount", "input", "token", "max", "decimals", "balance", "form"],
    files: ["components/solana/token-amount-input.tsx", "lib/solana/format.ts"],
    examples: [
      { id: "default", title: "With balance", code: `const [amount, setAmount] = useState("");\n\n<TokenAmountInput\n  value={amount}\n  onChange={setAmount}\n  symbol="SOL"\n  balance={12.5}\n  usdPrice={180}\n/>` },
      { id: "states", title: "States", code: `<TokenAmountInput value="99" onChange={set} symbol="USDC" balance={20} />\n<TokenAmountInput value="" onChange={set} symbol="BONK" loading />\n<TokenAmountInput value="1.5" onChange={set} symbol="JUP" disabled />` },
    ],
    props: [
      { name: "value", type: "string", required: true, description: "Controlled decimal string." },
      { name: "onChange", type: "(value: string) => void", required: true, description: "Receives a sanitised value." },
      { name: "token", type: "TokenInfo", description: "Token metadata (falls back to a symbol lookup)." },
      { name: "symbol", type: "string", description: "Token symbol when no token object is given." },
      { name: "decimals", type: "number", default: "token decimals", description: "Maximum fraction digits." },
      { name: "balance", type: "number | string | null", description: "Enables Max and the insufficient-balance error." },
      { name: "reserve", type: "number", default: "0.002 for SOL", description: "Amount kept back by Max for fees." },
      { name: "usdPrice", type: "number", description: "Shows ≈ USD under the input." },
      { name: "tokenSlot", type: "ReactNode", description: "Replace the token chip (e.g. TokenSelector)." },
      { name: "label", type: "string", default: '"Amount"', description: "Visible label." },
      { name: "error", type: "string | null", description: "External error that overrides validation." },
      { name: "loading / disabled / readOnly", type: "boolean", description: "Field states." },
      className,
    ],
    a11y: ["Uses inputMode=decimal for mobile keypads.", "Errors are linked with aria-describedby and set aria-invalid."],
  },
  {
    slug: "token-selector",
    name: "Token Selector",
    category: "Assets",
    summary: "Searchable token picker with keyboard navigation.",
    description: "A token chip that opens a command-style picker. Search by symbol, name or a pasted mint address, use the popular shortcuts and see balances. Tokens already picked elsewhere can be disabled.",
    keywords: ["token", "select", "picker", "search", "mint", "combobox"],
    files: ["components/solana/token-selector.tsx", "components/solana/token-icon.tsx", "lib/solana/tokens.ts"],
    examples: [{ id: "default", title: "Default", code: `const [token, setToken] = useState(findToken("SOL")!);\n\n<TokenSelector value={token} onValueChange={setToken} />` }],
    props: [
      { name: "value", type: "TokenInfo", required: true, description: "Selected token." },
      { name: "onValueChange", type: "(token: TokenInfo) => void", required: true, description: "Selection handler." },
      { name: "tokens", type: "TokenInfo[]", default: "TOKENS", description: "Token list." },
      { name: "balances", type: "Record<mint, number>", description: "Balances to show and sort by." },
      { name: "disabledMints", type: "string[]", description: "Mints that can't be selected." },
      { name: "label", type: "string", default: '"Select a token"', description: "Dialog title." },
      className,
    ],
    a11y: ["Combobox input with aria-activedescendant over a listbox.", "Arrow keys move, Enter selects, Escape closes; an empty state is announced."],
  },
  {
    slug: "token-icon",
    name: "Token Icon",
    category: "Assets",
    summary: "Token logo with graceful fallback.",
    description: "Renders a token's logo, the Solana glyph for SOL, or a gradient monogram from the token's brand colours. No broken images.",
    keywords: ["token", "icon", "logo", "avatar"],
    files: ["components/solana/token-icon.tsx"],
    examples: [{ id: "default", title: "Tokens", code: `{TOKENS.map((token) => <TokenIcon key={token.mint} token={token} size={36} />)}` }],
    props: [
      { name: "token", type: "TokenInfo", required: true, description: "Token metadata." },
      { name: "size", type: "number", default: "28", description: "Pixel size." },
      className,
    ],
    a11y: ["Decorative by default; always render the symbol as text next to it."],
  },
  {
    slug: "nft-card",
    name: "NFT Card",
    category: "Assets",
    summary: "Collectible tile with tilt, glare and actions.",
    description: "A tile for collectibles: pointer-tracked 3D tilt and glare, verified collection seal, traits, favourite toggle and a buy action. Without an image it draws deterministic gooey generative art from the mint.",
    keywords: ["nft", "collectible", "card", "art", "tilt", "marketplace"],
    files: ["components/solana/nft-card.tsx"],
    isNew: true,
    examples: [{ id: "default", title: "Gallery", code: `<NftCard\n  name="Goo #0421"\n  collection="Solsjin Genesis"\n  verified\n  mint="GooA…"\n  price={4.2}\n  attributes={[{ trait: "Body", value: "Liquid" }]}\n  onBuy={() => buy(mint)}\n/>` }],
    props: [
      { name: "name", type: "string", required: true, description: "Item name." },
      { name: "collection", type: "string", description: "Collection name." },
      { name: "verified", type: "boolean", description: "Shows the verified seal." },
      { name: "image", type: "string", description: "Media URL. Omit for generative art." },
      { name: "mint", type: "string", description: "Mint address (art seed and explorer link)." },
      { name: "price", type: "number", description: "Listing price in SOL." },
      { name: "attributes", type: "{ trait: string; value: string }[]", description: "Up to 3 traits are overlaid." },
      { name: "onBuy", type: "() => void", description: "Shows the buy button." },
      { name: "buyLabel", type: "string", default: '"Buy now"', description: "Buy button text." },
      className,
    ],
    a11y: ["Favourite is a toggle button with aria-pressed.", "Tilt only reacts to a mouse and is disabled under reduced motion."],
  },
  // ---------------------------------------------------------------- Transactions
  {
    slug: "send-sol-form",
    name: "Send SOL Form",
    category: "Transactions",
    summary: "A complete, validated SOL transfer.",
    description: "Recipient validation, live balance, Max with fee reserve, wallet signature, confirmation tracking, toast and inline status. It sends real transactions on the selected cluster.",
    keywords: ["send", "transfer", "pay", "form", "transaction"],
    files: ["components/solana/send-sol-form.tsx", "components/solana/hooks.ts"],
    provider: true,
    live: true,
    examples: [{ id: "default", title: "Live", description: "Switch to devnet and airdrop first to try it for free.", code: `<SendSolForm onSent={(signature) => console.log(signature)} />` }],
    props: [
      { name: "onSent", type: "(signature: string) => void", description: "Called after confirmation." },
      className,
    ],
    a11y: ["Native form semantics with labelled fields; Enter submits.", "Errors are linked to fields; progress is announced by TransactionStatus."],
  },
  {
    slug: "swap-widget",
    name: "Swap Widget",
    category: "Transactions",
    summary: "Jupiter-routed swaps with live quotes.",
    description: "Debounced live quotes from Jupiter with rate, minimum received, price impact and route. Choose slippage, flip direction and pick tokens. Executes through the connected wallet on mainnet.",
    keywords: ["swap", "jupiter", "dex", "trade", "quote", "exchange"],
    files: ["components/solana/swap-widget.tsx", "components/solana/token-selector.tsx", "components/solana/token-amount-input.tsx"],
    deps: ["Jupiter Swap API (lite-api.jup.ag)"],
    provider: true,
    live: true,
    isNew: true,
    examples: [{ id: "default", title: "Live quotes", code: `<SwapWidget defaultInput="SOL" defaultOutput="USDC" />` }],
    props: [
      { name: "defaultInput", type: "string", default: '"SOL"', description: "Initial pay token (symbol or mint)." },
      { name: "defaultOutput", type: "string", default: '"USDC"', description: "Initial receive token." },
      { name: "tokens", type: "TokenInfo[]", default: "TOKENS", description: "Tokens offered in the selectors." },
      className,
    ],
    a11y: ["Quote details are in a polite live region.", "The flip button's label states the resulting direction."],
    notes: ["Quotes always use mainnet liquidity. On devnet or testnet the button offers to switch clusters.", "Quotes refresh every 20 seconds."],
  },
  {
    slug: "airdrop-button",
    name: "Airdrop Button",
    category: "Transactions",
    summary: "Devnet and testnet SOL faucet in one click.",
    description: "Requests an airdrop for the connected wallet, waits for confirmation and reports through a toast. Disabled on mainnet. Rate limits link to the web faucet.",
    keywords: ["airdrop", "faucet", "devnet", "test sol"],
    files: ["components/solana/airdrop-button.tsx"],
    provider: true,
    live: true,
    examples: [{ id: "default", title: "Live", code: `<AirdropButton amount={1} />` }],
    props: [
      { name: "amount", type: "number", default: "1", description: "SOL to request." },
      { name: "address", type: "string", description: "Recipient. Defaults to the connected wallet." },
      { name: "onSuccess", type: "(signature: string) => void", description: "Called after confirmation." },
      { name: "variant / size", type: "ButtonProps", description: "Button styling." },
      className,
    ],
    a11y: ["The disabled reason is exposed through the title attribute."],
  },
  {
    slug: "transaction-status",
    name: "Transaction Status",
    category: "Transactions",
    summary: "Stepper for sign, confirm and finalized.",
    description: "Visualises a transaction lifecycle with an animated stepper, the error message and the signature with copy and explorer actions. Maps 1:1 to useSendTransaction().phase.",
    keywords: ["transaction", "status", "signature", "confirm", "stepper", "progress"],
    files: ["components/solana/transaction-status.tsx"],
    examples: [
      { id: "default", title: "Lifecycle", description: "Replay to watch it step through.", code: `const tx = useSendTransaction();\n\n<TransactionStatus state={tx.phase} signature={tx.signature} error={tx.error} />` },
      { id: "states", title: "All states", code: `<TransactionStatus state="signing" />\n<TransactionStatus state="confirming" signature={sig} />\n<TransactionStatus state="confirmed" signature={sig} />\n<TransactionStatus state="failed" error="Blockhash expired" />` },
    ],
    props: [
      { name: "state", type: '"idle" | "signing" | "confirming" | "confirmed" | "failed" | "processing"', required: true, description: "Lifecycle phase (processing is an alias for confirming)." },
      { name: "signature", type: "string | null", description: "Shows copy and explorer actions." },
      { name: "error", type: "string | null", description: "Shown when failed." },
      { name: "cluster", type: "SolanaCluster", description: "Explorer cluster. Defaults to the provider cluster." },
      { name: "title", type: "string", default: '"Transaction"', description: "Heading." },
      className,
    ],
    a11y: ["role=status (role=alert when failed) with aria-live.", "The current step is marked with aria-current=step."],
  },
  {
    slug: "transaction-toast",
    name: "Transaction Toast",
    category: "Transactions",
    summary: "Gooey toasts that track signatures.",
    description: "Notifications that morph between loading, success and error. The status droplet pulls away from the pill and re-merges. useTransactionToast().track(signature) follows any signature to confirmation.",
    keywords: ["toast", "notification", "signature", "gooey", "sonner"],
    files: ["components/providers/toast.tsx", "components/solana/transaction-toast.tsx", "components/motion/goo.tsx"],
    provider: true,
    live: true,
    isNew: true,
    examples: [
      { id: "default", title: "Fire a toast", code: `const { toast, update } = useToast();\n\nconst id = toast({ status: "loading", title: "Sending 1 SOL" });\nupdate(id, { status: "success", title: "Sent", action: { label: "View", href } });` },
      { id: "track", title: "Track a signature", code: `const { track } = useTransactionToast();\n\nawait track(signature, { title: "Mint" });` },
    ],
    props: [
      { name: "status", type: '"loading" | "success" | "error" | "info"', required: true, description: "Toast status." },
      { name: "title", type: "string", required: true, description: "Main line." },
      { name: "description", type: "string", description: "Secondary line." },
      { name: "action", type: "{ label: string; href?: string; onClick?: () => void }", description: "Inline action." },
      { name: "duration", type: "number", default: "5000 (8000 for errors, sticky while loading)", description: "Auto-dismiss time." },
    ],
    a11y: ["The toaster is a labelled polite region; toasts use role=status (alert for errors).", "Loading toasts stay until updated; each toast has a labelled dismiss button."],
  },
  // ---------------------------------------------------------------- Motion
  {
    slug: "gooey-tabs",
    name: "Gooey Tabs",
    category: "Motion",
    summary: "Segmented control with a liquid indicator.",
    description: "The indicator is a liquid capsule: its leading edge springs to the new option while the trailing edge follows on a softer spring, so it stretches in flight and pulls itself back into a perfect pill. Two circles and a bar move with transforms only, and a light SVG goo pass welds the seams. It works as tabs or as a radio group and is reused across Solsjin.",
    keywords: ["tabs", "segmented", "gooey", "metaball", "motion", "svg filter"],
    files: ["components/motion/gooey-tabs.tsx", "components/motion/goo.tsx"],
    deps: ["motion"],
    isNew: true,
    examples: [
      { id: "default", title: "Tabs", code: `const [tab, setTab] = useState("tokens");\n\n<GooeyTabs\n  ariaLabel="Portfolio"\n  value={tab}\n  onValueChange={setTab}\n  options={[\n    { value: "tokens", label: "Tokens" },\n    { value: "nfts", label: "NFTs" },\n    { value: "activity", label: "Activity" },\n  ]}\n/>` },
      { id: "goo", title: "Goo filter", description: "The primitive behind it, usable anywhere.", code: `const id = useGooId("blob");\n\n<GooFilter id={id} blur={8} alpha={19} shift={-8} />\n<div style={gooStyle(id)}>\n  <motion.span className="size-12 rounded-full bg-fg" animate={{ x: 40 }} />\n  <span className="size-12 rounded-full bg-fg" />\n</div>` },
    ],
    props: [
      { name: "options", type: "{ value; label; icon?; disabled? }[]", required: true, description: "Segments." },
      { name: "value", type: "T", required: true, description: "Selected value." },
      { name: "onValueChange", type: "(value: T) => void", required: true, description: "Change handler." },
      { name: "ariaLabel", type: "string", required: true, description: "Accessible group name." },
      { name: "semantics", type: '"tabs" | "radio"', default: '"tabs"', description: "ARIA pattern." },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "Height." },
      { name: "fill", type: "boolean", default: "false", description: "Stretch options." },
      { name: "idPrefix", type: "string", description: "Links tabs to panels via aria-controls." },
      className,
    ],
    a11y: ["Full tablist or radiogroup keyboard support (arrows, Home, End).", "Under reduced motion the indicator jumps without stretching."],
  },
  {
    slug: "liquid-glass",
    name: "Liquid Glass",
    category: "Motion",
    summary: "A live, refracting glass material for bars, menus and sheets.",
    description:
      "A layered glass material: whatever scrolls underneath stays visible but softly blurred and saturated, a tint keeps text legible in light and dark mode, and a specular rim catches the light. In Chromium an SVG displacement map also bends the backdrop along the edges like a real lens; Safari and Firefox get the same material without the bend. The blur, tint and rim live on child layers, so the element itself can move, morph and fade without ever breaking the backdrop. Pair it with ScrollEdge for the soft progressive blur under a sticky header.",
    keywords: ["glass", "liquid glass", "blur", "frosted", "backdrop", "navbar", "refraction", "ios"],
    files: ["components/ui/liquid-glass.tsx", "app/globals.css"],
    deps: ["motion"],
    isNew: true,
    examples: [
      {
        id: "default",
        title: "Over scrolling content",
        description: "Scroll the feed: the bar keeps it visible but blurred.",
        code: `<div className="relative h-72 overflow-auto">\n  <LiquidGlass className="sticky top-3 mx-3 flex h-12 items-center px-4" radius={9999} refraction>\n    Inbox\n  </LiquidGlass>\n  {items}\n</div>`,
      },
      {
        id: "materials",
        title: "Materials",
        code: `<LiquidGlass material="clear">Clear</LiquidGlass>\n<LiquidGlass material="regular">Regular</LiquidGlass>\n<LiquidGlass material="thick">Thick</LiquidGlass>`,
      },
      {
        id: "header",
        title: "Scroll edge",
        description: "The progressive blur used under the site header.",
        code: `<header className="fixed inset-x-0 top-0">\n  <ScrollEdge active={scrolled} height={92} />\n  <LiquidGlass className="mx-auto h-14 max-w-3xl" material={scrolled ? "regular" : "clear"} radius={9999} refraction>\n    …\n  </LiquidGlass>\n</header>`,
      },
    ],
    props: [
      { name: "material", type: '"clear" | "regular" | "thick"', default: '"regular"', description: "How much tint sits over the blurred backdrop." },
      { name: "radius", type: "number", default: "24", description: "Corner radius in px (use 9999 for a pill). Also shapes the refraction map." },
      { name: "refraction", type: "boolean", default: "false", description: "Bend the backdrop along the edges (Chromium only, falls back to plain blur)." },
      { name: "depth", type: "number", default: "18", description: "Refraction strength in px." },
      { name: "presence", type: "boolean", default: "false", description: "Fade each layer through variants (hidden / shown) instead of the element, keeping the blur alive mid-fade." },
      { name: "as", type: "ElementType", default: '"div"', description: "Rendered element." },
      className,
    ],
    a11y: [
      "Purely visual; it renders a plain element and never changes semantics.",
      "Tints are tuned so body text meets contrast over busy content in both themes.",
      "Browsers without backdrop-filter get a solid fallback tint.",
    ],
    notes: ["Never put opacity, filter or backdrop-filter on an ancestor of the glass: that hides the backdrop from it. Use the presence prop for fades."],
  },
  {
    slug: "liquid-metal-button",
    name: "Liquid Metal Button",
    category: "Motion",
    summary: "A dark glass button ringed in flowing chrome.",
    description:
      "A call-to-action wrapped in a ring of liquid chrome. Two counter-rotating conic gradients are blended and warped through a fractal-noise displacement map, so the reflections ripple like molten metal. A specular hotspot follows the pointer and a sheen sweeps the face on hover, with no scaling and no WebGL.",
    keywords: ["button", "cta", "metal", "chrome", "liquid", "shine", "hero"],
    files: ["components/motion/liquid-metal-button.tsx", "app/globals.css"],
    deps: ["next"],
    isNew: true,
    examples: [
      {
        id: "default",
        title: "Pill and circle",
        code: `<LiquidMetalButton href="/components">\n  Get started <ArrowRightIcon size={16} weight="bold" />\n</LiquidMetalButton>\n\n<LiquidMetalButton aria-label="Generate" shape="circle">\n  <SparkleIcon size={18} weight="fill" />\n</LiquidMetalButton>`,
      },
      {
        id: "sizes",
        title: "Sizes",
        description: "The rim gets thicker as the button grows, so the metal reads at every size.",
        code: `<LiquidMetalButton size="sm">Small</LiquidMetalButton>\n<LiquidMetalButton size="md">Medium</LiquidMetalButton>\n<LiquidMetalButton size="lg">Large</LiquidMetalButton>`,
      },
      {
        id: "speed",
        title: "Calm vs. lively",
        description: "speed sets the rim's rotation period in seconds.",
        code: `<LiquidMetalButton speed={14}>Calm</LiquidMetalButton>\n<LiquidMetalButton speed={3}>Lively</LiquidMetalButton>`,
      },
    ],
    props: [
      { name: "children", type: "ReactNode", required: true, description: "Label and/or icon." },
      { name: "href", type: "string", description: "Renders a Next.js Link (or an <a> when external) instead of a button." },
      { name: "external", type: "boolean", default: "false", description: "With href: opens in a new tab with rel=noreferrer." },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height, padding and rim thickness." },
      { name: "shape", type: '"pill" | "circle"', default: '"pill"', description: "Circle is icon-only; pass aria-label." },
      { name: "speed", type: "number", default: "7", description: "Seconds per rim rotation." },
      className,
    ],
    a11y: [
      "Renders a native <button> or link, so keyboard and screen-reader behaviour is built in; the focus ring sits outside the rim.",
      "All decoration is aria-hidden, and under prefers-reduced-motion the rim and sheen are still.",
      "The label is white on near-black (well above 7:1).",
    ],
  },
  // ---------------------------------------------------------------- Primitives
  {
    slug: "button",
    name: "Button",
    category: "Primitives",
    summary: "Six variants, five sizes and a loading state.",
    description: "The base button with tactile press feedback, a visible focus ring and a loading state that keeps width stable.",
    keywords: ["button", "cta", "action", "loading"],
    files: ["components/ui/button.tsx", "components/ui/spinner.tsx"],
    examples: [
      { id: "default", title: "Variants", code: `<Button>Primary</Button>\n<Button variant="accent">Accent</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="danger">Danger</Button>` },
      { id: "sizes", title: "Sizes and states", code: `<Button size="sm">Small</Button>\n<Button size="lg">Large</Button>\n<Button loading>Saving</Button>\n<Button size="icon" aria-label="Settings"><GearSixIcon /></Button>` },
    ],
    props: [
      { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger" | "accent"', default: '"primary"', description: "Visual style." },
      { name: "size", type: '"sm" | "md" | "lg" | "icon" | "icon-sm"', default: '"md"', description: "Size." },
      { name: "loading", type: "boolean", default: "false", description: "Spinner, aria-busy and disabled." },
      { name: "...props", type: "ButtonHTMLAttributes", description: "All native button props." },
    ],
    a11y: ["type=button by default, so it never submits a form by accident.", "Icon-only buttons need an aria-label."],
  },
  {
    slug: "badge",
    name: "Badge",
    category: "Primitives",
    summary: "Compact status labels.",
    description: "Seven semantic tones for statuses, clusters and tags.",
    keywords: ["badge", "tag", "label", "status", "pill"],
    files: ["components/ui/badge.tsx"],
    examples: [{ id: "default", title: "Tones", code: `<Badge>Neutral</Badge>\n<Badge tone="success">Confirmed</Badge>\n<Badge tone="warning">Pending</Badge>\n<Badge tone="danger">Failed</Badge>\n<Badge tone="solana">Solana</Badge>\n<Badge tone="violet">Devnet</Badge>\n<Badge tone="outline">Outline</Badge>` }],
    props: [{ name: "tone", type: '"neutral" | "success" | "warning" | "danger" | "solana" | "violet" | "outline"', default: '"neutral"', description: "Colour." }, className],
    a11y: ["Never rely on tone alone; the text carries the meaning."],
  },
  {
    slug: "input",
    name: "Input",
    category: "Primitives",
    summary: "Text field, label and hint.",
    description: "Form primitives with invalid styling, hints and consistent focus rings.",
    keywords: ["input", "field", "form", "label", "text"],
    files: ["components/ui/input.tsx"],
    examples: [{ id: "default", title: "Field", code: `<Label htmlFor="memo">Memo</Label>\n<Input id="memo" placeholder="Optional note" />\n<FieldHint>Stored on-chain, visible to everyone.</FieldHint>` }],
    props: [
      { name: "invalid", type: "boolean", default: "false", description: "Sets error styling and aria-invalid." },
      { name: "...props", type: "InputHTMLAttributes", description: "All native input props." },
    ],
    a11y: ["Pair every Input with a Label and connect hints with aria-describedby."],
  },
  {
    slug: "card",
    name: "Card",
    category: "Primitives",
    summary: "Composable surface with header and footer.",
    description: "Card, CardHeader, CardTitle, CardDescription, CardContent and CardFooter: the surface every Solsjin widget sits on.",
    keywords: ["card", "surface", "panel", "container"],
    files: ["components/ui/card.tsx"],
    examples: [{ id: "default", title: "Card", code: `<Card>\n  <CardHeader>\n    <CardTitle>Staking</CardTitle>\n    <CardDescription>Earn ~7% APY.</CardDescription>\n  </CardHeader>\n  <CardContent>…</CardContent>\n  <CardFooter><Button>Stake</Button></CardFooter>\n</Card>` }],
    props: [{ name: "...props", type: "HTMLAttributes<HTMLDivElement>", description: "Each part forwards native div props." }],
    a11y: ["CardTitle renders an h3. Adjust the level if your outline needs it."],
  },
  {
    slug: "dialog",
    name: "Dialog",
    category: "Primitives",
    summary: "Accessible, animated modal.",
    description: "Portal-mounted dialog with focus trap, Escape and backdrop close, scroll lock, focus restore and spring animation.",
    keywords: ["dialog", "modal", "overlay", "popup"],
    files: ["components/ui/dialog.tsx"],
    examples: [{ id: "default", title: "Dialog", code: `<Dialog open={open} onOpenChange={setOpen} title="Confirm swap" description="Review before signing.">\n  …\n</Dialog>` }],
    props: [
      { name: "open", type: "boolean", required: true, description: "Visibility." },
      { name: "onOpenChange", type: "(open: boolean) => void", required: true, description: "Close handler." },
      { name: "title", type: "ReactNode", required: true, description: "Accessible title." },
      { name: "description", type: "ReactNode", description: "Accessible description." },
      { name: "hideHeader", type: "boolean", description: "Visually hide the header." },
      { name: "position", type: '"center" | "top"', default: '"center"', description: "Placement." },
      className,
    ],
    a11y: ["role=dialog, aria-modal, labelled and described.", "Add data-autofocus to the element that should receive focus first."],
  },
];

export const REGISTRY_BY_SLUG = Object.fromEntries(REGISTRY.map((entry) => [entry.slug, entry])) as Record<string, RegistryEntry>;

export function getEntry(slug: string) {
  return REGISTRY_BY_SLUG[slug];
}

export function groupedRegistry() {
  return CATEGORIES.map((category) => ({ ...category, items: REGISTRY.filter((entry) => entry.category === category.name) }));
}

export function neighbours(slug: string) {
  const ordered = groupedRegistry().flatMap((group) => group.items);
  const index = ordered.findIndex((entry) => entry.slug === slug);
  return { prev: index > 0 ? ordered[index - 1] : null, next: index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null };
}
