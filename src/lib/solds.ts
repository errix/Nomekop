/**
 * Recent-solds adapter.
 *
 * Primary data intent for the card-modal bar is TCGPlayer recent sales (NM raw).
 * No live feed is wired — no scrape, no invented paid API.
 *
 * Swap hook: `loadLiveSoldRange` is where a future partner-key / paid-vendor
 * adapter keyed to TCGPlayer product IDs should land. Same filters later:
 * NM raw, windowed, outlier-aware, graded as a separate series.
 *
 * Until that adapter exists:
 * - Dev / `VITE_SHOW_EXAMPLE_SOLDS=true`: bar comes only from fixture rows
 *   (`MOCK_SOLDS` / locked Charizard). Never synthesize L/M/H from Market/Mid
 *   (asks are not clears).
 * - Prod default: hide the bar / "Solds unavailable" rather than unlabeled
 *   fake comps.
 *
 * eBay solds are not the bar feed (secondary verify via deep link only).
 * pokemontcg.io stays catalog/identity.
 */
import { MOCK_SOLDS } from '../data/solds-mock';
import type { TcgCard } from './tcgTypes';

export type SoldKind = 'raw' | 'graded';

export type SoldSale = {
  price: number;
  date: string;
  kind: SoldKind;
  outlier?: boolean;
};

export type SoldRange = {
  cardId: string;
  kind: SoldKind;
  windowDays: number;
  soldCount: number;
  low: number;
  mid: number;
  high: number;
  source: 'mock' | 'tcgplayer';
  example: boolean;
  sales: SoldSale[];
};

export const THIN_SOLD_THRESHOLD = 5;

export type SoldsEnv = {
  DEV?: boolean;
  VITE_SHOW_EXAMPLE_SOLDS?: string;
};

export function exampleSoldsEnabled(env: SoldsEnv = import.meta.env): boolean {
  const flag = env.VITE_SHOW_EXAMPLE_SOLDS?.trim().toLowerCase();
  if (flag === 'true' || flag === '1') return true;
  if (flag === 'false' || flag === '0') return false;
  return env.DEV === true;
}

export function isThinSoldCount(count: number): boolean {
  return count > 0 && count < THIN_SOLD_THRESHOLD;
}

/** Fixture caption is `Nd · N sold`. ` · TCGPlayer` is live-feed only. */
export function soldRangeCaption(
  range: Pick<SoldRange, 'windowDays' | 'soldCount' | 'example'>,
): string {
  const base = `${range.windowDays}d · ${range.soldCount} sold`;
  return range.example ? base : `${base} · TCGPlayer`;
}

export function rangePercent(value: number, low: number, high: number): number {
  if (high <= low) return 50;
  return Math.min(100, Math.max(0, ((value - low) / (high - low)) * 100));
}

export function formatCompactUsd(value: number): string {
  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.005) {
    return `$${rounded}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function salesFor(cardId: string, kind: SoldKind): SoldSale[] {
  return (MOCK_SOLDS[cardId] ?? []).filter((sale) => sale.kind === kind);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
  return sorted[mid];
}

function summarize(cardId: string, kind: SoldKind, sales: SoldSale[]): SoldRange | undefined {
  const locked = LOCKED_RANGES[cardId];
  if (locked && locked.kind === kind) {
    return { ...locked, sales };
  }

  const inliers = sales.filter((sale) => !sale.outlier).map((sale) => sale.price);
  if (inliers.length === 0) return undefined;
  return {
    cardId,
    kind,
    windowDays: 14,
    soldCount: inliers.length,
    low: Math.min(...inliers),
    mid: median(inliers),
    high: Math.max(...inliers),
    source: 'mock',
    example: true,
    sales,
  };
}

/** Charizard SIR mock locked to uploads/sold-range-tile.html. */
const LOCKED_RANGES: Record<string, Omit<SoldRange, 'sales'>> = {
  'sv3pt5-199': {
    cardId: 'sv3pt5-199',
    kind: 'raw',
    windowDays: 14,
    soldCount: 11,
    low: 385,
    mid: 405,
    high: 428,
    source: 'mock',
    example: true,
  },
};

/**
 * Future TCGPlayer NM-raw solds feed (partner key / vendor keyed to
 * product IDs). Returns undefined until that adapter is wired.
 */
export function loadLiveSoldRange(_card: TcgCard, _kind: SoldKind = 'raw'): SoldRange | undefined {
  return undefined;
}

function fixtureSoldRange(card: TcgCard, kind: SoldKind): SoldRange | undefined {
  return summarize(card.id, kind, salesFor(card.id, kind));
}

/** Modal/default series is raw. Graded is a separate series for the detail sheet. */
export function loadSoldRange(
  card: TcgCard,
  kind: SoldKind = 'raw',
  env: SoldsEnv = import.meta.env,
): SoldRange | undefined {
  const live = loadLiveSoldRange(card, kind);
  if (live) return live;
  if (!exampleSoldsEnabled(env)) return undefined;
  return fixtureSoldRange(card, kind);
}
