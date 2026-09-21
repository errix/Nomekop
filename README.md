# Nomekop

Phone-friendly lookup for **art-forward / illustration-style** Pokémon TCG prints, with current TCGPlayer (USD) snapshots from [pokemontcg.io](https://pokemontcg.io) API v2. US market only — Cardmarket / EUR is not shown.

Search is **species-first**: you type a name, Nomekop resolves it to National Dex number(s), then queries `nationalPokedexNumbers:{dex}`. Alolan / Galarian / Hisuian / Paldean / costume / TAG TEAM prints of the same species land in one bucket. Form pills stay in the results chrome; the print grid itself is **image-only**.

**Inspect a print.** Phone grid is two columns of card art (no prices, sold bar, rarity, venue buttons, or honesty badges on the tile). Tap a tile for a **centered modal** with name / set / rarity, TCGPlayer Market + Mid USD, the recent-solds bar, and TCGPlayer / eBay deep links. Modal **X** or the dimmed backdrop returns to the grid. The fullscreen icon opens an **image-only** view; a chevron back-arrow returns to the still-open modal (no X on fullscreen). Desktop fullscreen: click-drag tilts the card and a soft white glare follows the pointer; release springs flat. Idle hover tracks glare without tilting. No foil / rainbow sheen — glare is white only, and only on the fullscreen card (not the grid or density modal).

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

Lookups send `q=nationalPokedexNumbers:{dex}` (the species join key — not a name wildcard). Art-forward rarities are applied in our taxonomy filter. (Quoted multi-rarity Lucene ORs currently 500 on pokemontcg.io.)

A key is optional: the public API works without one at a much lower rate limit. If the live request fails (rate limit, network), the app falls back to a **small sample dataset** so the UI and art-forward filter can still be reviewed. The page banner says when sample data is in use.

**Recent solds.** There is no free live TCGPlayer recent-sales feed yet (no paid API, no scrape). [`src/lib/solds.ts`](src/lib/solds.ts) `loadLiveSoldRange` is the swap hook for a future partner-key / vendor adapter keyed to TCGPlayer product IDs (NM raw, windowed, outlier-aware; graded stays a separate series). Until then:

- The bar is **fixture/example comps only** (`MOCK_SOLDS`, mock-flagged). L / median / H + N + window come from those rows. We do **not** synthesize solds from Market/Mid (asks are not clears).
- Dev shows fixtures (Charizard `sv3pt5-199` is locked to $385 / $405 / $428, `14d · 11 sold`). The caption stays `Nd · N sold` on fixtures; ` · TCGPlayer` is reserved for a real `loadLiveSoldRange` feed. Prod hides the bar and shows **Solds unavailable** unless `VITE_SHOW_EXAMPLE_SOLDS=true`.
- The **TCGPlayer** and **eBay** buttons are live venue deep links (product page + sold/completed search). eBay solds are verify-only and are not the bar feed. pokemontcg.io stays catalog/identity.

The modal bar is **raw** inliers only; graded comps and outliers live on the detail sheet. Thin samples dim the caption but do not hide it.

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

**Not included:** Common, Uncommon, Rare, Rare Holo, Double Rare (standard Scarlet & Violet ex), bare Promo that is not on the special-art allowlist. Subtypes alone (Tera, Ancient, Future, ex, V, VMAX, VSTAR, …) are not treated as full-art signals. Regular set VSTAR 018 stays out; Rare Rainbow still comes in via the rarity allowlist.

**Special-art Black Star promos:** a Promo is included only when `card.id` is in [`src/data/special-art-promos-seed-v1.json`](src/data/special-art-promos-seed-v1.json) (curated **43** ids, including Charizard UPC `swshp-SWSH260` / `SWSH261` / `SWSH262`) **or** the existing rarity/gallery net already passes. This is not “all Promos.” Seed v1 `meta.gaps`: metal Arceus UPC cards, some Celebrations/Champions Path promos, most SVP product foils, and XY/BW special arts are left out for later review.

**Deferred (not baked in):** Classic Collection; treating every Rare Holo V/VMAX/VSTAR as chase; MEGA_ATTACK_RARE / Futuristic Rare / Black White Rare until live-sampled.

When a species has no matching prints, the UI says clearly that **no full-art / illustration prints were found yet**.

Taxonomy lives in [`src/config/art-forward-taxonomy.ts`](src/config/art-forward-taxonomy.ts) (schema: [`src/config/art-forward-taxonomy.schema.json`](src/config/art-forward-taxonomy.schema.json)).

## Species ownership (form pills)

Form pills keep the existing **label + count badge** and add a D1 rev3 ownership mark (species-level, not per-tile stamps):

- **Filled Poké Ball** (upside-down: red top / white bottom) — owns ≥1 full-art / illustration of that form
- **Empty ring** — form exists in the catalog, none owned
- **All forms** is a rollup: filled if any form is owned, empty ring if none

Source of truth is the free in-repo seed [`src/data/owned-species.json`](src/data/owned-species.json) (Eric’s EXAMPLE collection — Meowth matches the D1 rev3 mock pattern; Charizard is a second example). The app reads it through the typed loader in [`src/lib/ownedSpecies.ts`](src/lib/ownedSpecies.ts). This is not a live inventory API.

### Delibird write convention

Update [`src/data/owned-species.json`](src/data/owned-species.json) via pull request. Top-level shape is the staging draft contract — only these keys:

```json
{
  "version": 1,
  "updatedAt": "2026-09-21T00:00:00.000Z",
  "species": []
}
```

Per-species row:

| Field | Write rule |
| --- | --- |
| `key` | lowercase slug (`meowth`, `charizard`) |
| `dex` | National Dex number (Meowth `52`) |
| `forms` | catalog form ids → `true` if Eric owns ≥1 full-art / illustration of that form |
| `owned` | `true` iff any `forms` value is `true` (keep in sync) |
| `acquired` | reserved list (card ids later); unused by the pill UI today — write `[]` |

Form keys must match catalog ids from [`src/data/species-forms-catalog-v1.json`](src/data/species-forms-catalog-v1.json) (`base`, `alolan`, `galarian`, `mega-x`, … — same ids as `formIdFromLabel`). Species omitted from `species[]` render empty rings on every pill. Bump `updatedAt` (ISO-8601) on each write. Do not add a paid inventory API.

## Deploy

Set `POKEMONTCG_API_KEY` in the host’s environment. Free runtime deps only (`react`, `react-dom`).

### Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output: `dist`
- Serverless proxy: bundled [`api/cards.js`](api/cards.js) (used as `/api/cards?dex=6`)
- Source for that function is [`src/server/vercelCards.ts`](src/server/vercelCards.ts). Vercel compiles `/api/*.ts` one file at a time; Node ESM then cannot load `../src/server/handleCardsRequest` (prod log: `ERR_MODULE_NOT_FOUND`). `npm run build` inlines the lookup into a single `api/cards.js` so Hobby does not crash before the mock fallback.
- `POKEMONTCG_API_KEY` is optional. Without it the public pokemontcg.io rate limit applies; live failures still return sample prints instead of a hard 500.

### Netlify

- Build command: `npm run build`
- Publish: `dist`
- Function proxy is wired in [`netlify.toml`](netlify.toml) from `/api/cards` → `netlify/functions/cards`

SPA fallbacks are already configured so client-side `?q=Charizard` links work.

## Out of scope (slice 1)

Paid APIs, accounts, inventory/selling, and offline mode.
