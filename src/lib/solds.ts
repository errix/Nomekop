/**
 * Recent-solds adapter.
 *
 * Primary data intent for the tile bar is TCGPlayer recent sales (NM raw).
 * That feed is not wired yet — no paid API, no scrape. `loadSoldRange`
 * is the hook: swap MOCK_SOLDS / exampleFromUsd for a free TCGPlayer
 * NM-raw solds feed later.
 *
 * eBay solds are not the bar feed (secondary verify via deep link only).
 * pokemontcg.io stays catalog/identity. Until a free feed exists every
 * bar is example data (badge on the tile).
 */
import { MOCK_SOLDS } from '../data/solds-mock';
import { pricesFor, type TcgCard } from './tcgTypes';

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
  source: 'mock';
  example: true;
  sales: SoldSale[];
};

export const THIN_SOLD_THRESHOLD = 5;

export function isThinSoldCount(count: number): boolean {
  return count > 0 && count < THIN_SOLD_THRESHOLD;
}

/** Locked tile caption: window · count · TCGPlayer (primary solds intent). */
export function soldRangeCaption(range: Pick<SoldRange, 'windowDays' | 'soldCount'>): string {
  return `${range.windowDays}d · ${range.soldCount} sold · TCGPlayer`;
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

function exampleFromUsd(card: TcgCard, kind: SoldKind): SoldRange | undefined {
  const usd = pricesFor(card).tcgplayerUsd;
  const center = usd?.market ?? usd?.mid;
  if (center == null) return undefined;
  const spread = kind === 'graded' ? 0.08 : 0.05;
  const low = Math.round(center * (1 - spread));
  const high = Math.round(center * (1 + spread * 0.8));
  const mid = Math.round(center * (kind === 'graded' ? 1.02 : 0.98));
  return {
    cardId: card.id,
    kind,
    windowDays: 14,
    soldCount: kind === 'graded' ? 3 : 8,
    low,
    mid,
    high,
    source: 'mock',
    example: true,
    sales: [],
  };
}

/** Tile/default series is raw. Graded is a separate series for the detail sheet. */
export function loadSoldRange(card: TcgCard, kind: SoldKind = 'raw'): SoldRange | undefined {
  const sales = salesFor(card.id, kind);
  const fromSales = summarize(card.id, kind, sales);
  if (fromSales) return fromSales;
  return exampleFromUsd(card, kind);
}
