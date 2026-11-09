---
name: solsjin-ui-craft
description: >-
  Design and ship Solsjin UI surfaces to a production craft bar. Use when editing
  the marketing site, docs shell, components overview, hero, navbar, buttons,
  motion, typography, copy, or any frontend visual polish on solsjin. Synthesizes
  ui-skills.com guidance (frontend-design, animate, intentional-craft,
  web-design-guidelines, better-interface) into Solsjin-specific rules.
---

# Solsjin UI Craft

Opinionated craft skill for this repo. Goal: Solana component library UI that feels
**alive, precise, and owned** — never generic AI SaaS, never launch-page leftovers.

Sources absorbed (do not re-fetch unless auditing):

- anthropics / `frontend-design` — distinctive identity, anti-template aesthetics
- emilkowalski / `animate` — gate → purpose → tool → properties → curve
- kemiljk / `intentional-craft` — human promise → construction evidence
- vercel-labs / `web-design-guidelines` — a11y, focus, forms, motion, copy
- jakubkrehel / `better-interface` — evidence over taste; cheapest fix first

## Intention (write this once per task)

For Solsjin the person is a **Solana builder**. The job is: *find a working component,
trust it, copy it*. Feeling: **confidence + velocity**. Every change must serve that.

Reject work that only “looks cool” on a surface the user hits dozens of times a day
(nav, connect, browse). Delight lives in rare moments (first playground connect,
successful swap toast).

## Brand & visual identity (locked)

| Token | Rule |
| --- | --- |
| Brand | `SOLSJIN` / `solsjin` is the hero signal — never overpowered by a marketing headline |
| Type | Thunder for display; existing sans for UI. No Inter/Roboto/Arial/system defaults as the voice |
| Color | Token-driven light/dark. Accent is Solana mint (`--accent`), not purple-on-white |
| Material | Liquid glass for chrome; platinum bezel CTAs; goo only where already established |
| Motion | Liquid / goo / platinum rim — compositor-only; idle animations must not fight scroll |

### Hard bans (AI-slop cluster)

Never introduce:

1. Purple→indigo gradient themes or glow-everything chrome
2. Warm cream `#F4F1EA` + terracotta + high-contrast serif display
3. Broadsheet hairline newspaper layouts
4. SaaS card kit: identical floating cards, soft grey shadows, decorative gradient washes
5. Tracked ALL-CAPS eyebrows above every section
6. Accenting one word in a headline (italic/color/muted span) as the only personality
7. `→` appended to every link/button by habit
8. Meta rows: `A · B · C`, `WORD — fragment` labels
9. Inset/side-panel/collage heroes on marketing pages — full-bleed or none
10. Detached badges / stickers floating on hero media

Repo user rules for frontend design override this table when they conflict — follow both.

## Layout rules

- **One composition** in the first viewport: brand, one line of proof, one CTA group, optional install command. No stats strips, schedules, or promo chips in the hero.
- **One job per section**: one headline, usually one supporting sentence, then the interaction or list.
- **Cards only for interaction.** If removing border/shadow/radius doesn’t hurt understanding, remove them. Prefer divided lists / tight grids over floating cards.
- **Content inset**: give glass nav and page content real inner padding; don’t hug the pill edge.
- **Docs overview**: content starts below the sticky header with generous top padding (`pt-16`+).

## Motion protocol (emilkowalski sequence)

1. **Should it animate?** Keyboard / 100+/day → no. Occasional → yes. Rare → delight budget.
2. **Purpose** in one word: Feedback | Spatial | State | Prevent jarring | Explanation | Delight.
3. **Tool**: CSS transition → `@starting-style` → CSS animation → WAAPI → Motion. Cheapest wins.
4. **Properties**: `transform` / `opacity` only. Never `scale(0)`. Never `transition: all`.
5. **Curve**: enter/exit `cubic-bezier(0.23, 1, 0.32, 1)`; on-screen move strong ease-in-out; constant loops `linear`. No `ease-in` on UI.
6. **Duration**: press 100–160ms; popovers 125–200ms; UI under 300ms unless marketing explanation.
7. **Ship with**: `prefers-reduced-motion` and `@media (hover: hover) and (pointer: fine)` for hover motion.
8. **Scroll safety**: no always-on SVG filters + spinning layers on above-the-fold CTAs. Idle = static; hover may spin.

LiquidMetalButton: platinum bezel, no SVG warp, rim spins only on hover/focus.

## Copy protocol

- Active voice. Sentence case. Specific CTAs (“Browse components”, not “Get started”).
- Site is **live** — never “launching soon”, “Get launch updates”, or gated language on public marketing.
- Errors explain the fix. Empty states invite an action.
- Prefer `…` over `...`. Don’t sell — describe what the user can do.

## Accessibility & interaction (non-negotiable)

- Icon-only controls: `aria-label`
- Visible `:focus-visible` rings; never bare `outline-none`
- Semantic `button` vs `a`/`Link`
- Skip link to `#main` / `#top` on marketing pages
- `scroll-margin-top` on in-page anchors
- Touch: consider `touch-action: manipulation` on primary controls

## Process for every UI change

1. State the intention in one sentence.
2. Screenshot or inspect the current surface.
3. Change the smallest set of files that fulfill the intention.
4. Self-critique against **Hard bans** and Chanel’s rule: remove one accessory.
5. Verify: light + dark, mobile width, reduced-motion, keyboard focus.
6. Do not invent parallel token systems — extend `app/globals.css` tokens.

## When reviewing (better-interface posture)

- Evidence over taste. Cite `file:line`.
- Prefer Delete → Platform → Existing token → Correct value → Add.
- Escalation triggers (missing name, no focus, pointer-only, ignored reduced-motion, clipped at 320px, contrast fails) are **HIGH**.

## Output

Ship the code. Then at most three lines: intention served, what was cut, what to feel-check.
