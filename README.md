# Nomekop

Phone-friendly lookup for **art-forward / illustration-style** Pokémon TCG prints, with current TCGPlayer (USD) and Cardmarket (EUR) snapshots from [pokemontcg.io](https://pokemontcg.io) API v2.

Search is **species-first**: you type a name, Nomekop resolves it to National Dex number(s), then queries `nationalPokedexNumbers:{dex}`. Alolan / Galarian / Hisuian / Paldean / costume / TAG TEAM prints of the same species land in one bucket. Forms stay visible on each print row.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional, but recommended
# paste a free API key into .env.local
npm run dev
```

Open the printed URL (default [http://localhost:5173](http://localhost:5173)). Try **Charizard**, **Pikachu**, or **Meowth** (including “Alolan Meowth” / “Galarian Meowth” — they should share dex `#0052`).

```bash
npm test      # taxonomy + filter unit tests
npm run build
```

`.env.local` is gitignored. The env var name is `POKEMONTCG_API_KEY` (never hardcode it).

## Free API key

1. Sign up at [https://dev.pokemontcg.io](https://dev.pokemontcg.io)
2. Copy the key into `.env.local`:

```
POKEMONTCG_API_KEY=your_key_here
```

The browser never sees the key. Vite (dev/preview), Vercel (`/api/cards`), and Netlify (`/.netlify/functions/cards`) attach it as `X-Api-Key` when calling pokemontcg.io.

A key is optional: the public API works without one at a much lower rate limit. If the live request fails (rate limit, network), the app falls back to a **small sample dataset** so the UI and art-forward filter can still be reviewed. The page banner says when sample data is in use.

## What is included (slice 1)

Exact pokemontcg.io rarity strings:

- Illustration Rare
- Special Illustration Rare
- Amazing Rare
- Radiant Rare
- Rare Ultra
- Ultra Rare
- Rare Rainbow
- Rare Secret
- Trainer Gallery Rare Holo
- Shiny Rare
- Shiny Ultra Rare
- Rare Shiny
- Rare Shiny GX
- Mega Hyper Rare
- **Hyper Rare** only when `supertype` is Pokémon

Gallery `set.id`s: `swsh9tg`, `swsh10tg`, `swsh11tg`, `swsh12tg`, `swsh12pt5gg`, plus glob patterns `*tg` / `*gg`.

Trainer SIRs and Trainer/Galarian Gallery cards are included when they match those flags. Energy is always excluded.

**Not included:** Common, Uncommon, Rare, Rare Holo, Double Rare (standard Scarlet & Violet ex), bare Promo. Subtypes alone (Tera, Ancient, Future, ex, V, VMAX, VSTAR, …) are not treated as full-art signals.

**Deferred (not baked in):** Classic Collection; promo alt arts; treating every Rare Holo V/VMAX/VSTAR as chase; MEGA_ATTACK_RARE / Futuristic Rare / Black White Rare until live-sampled.

When a species has no matching prints, the UI says clearly that **no full-art / illustration prints were found yet**.

Taxonomy lives in [`src/config/art-forward-taxonomy.ts`](src/config/art-forward-taxonomy.ts) (schema: [`src/config/art-forward-taxonomy.schema.json`](src/config/art-forward-taxonomy.schema.json)).

## Deploy

Set `POKEMONTCG_API_KEY` in the host’s environment. Free runtime deps only (`react`, `react-dom`).

### Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output: `dist`
- Serverless proxy: [`api/cards.ts`](api/cards.ts) (used as `/api/cards?dex=6`)

### Netlify

- Build command: `npm run build`
- Publish: `dist`
- Function proxy is wired in [`netlify.toml`](netlify.toml) from `/api/cards` → `netlify/functions/cards`

SPA fallbacks are already configured so client-side `?q=Charizard` links work.

## Out of scope (slice 1)

Paid APIs, accounts, inventory/selling, and offline mode.
