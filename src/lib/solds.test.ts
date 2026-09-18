import { describe, expect, it } from 'vitest';
import { MOCK_CARDS } from '../data/mockCards';
import { formatMoney, pricesFor } from './tcgTypes';
import {
  exampleSoldsEnabled,
  formatCompactUsd,
  isThinSoldCount,
  loadLiveSoldRange,
  loadSoldRange,
  rangePercent,
  soldRangeCaption,
} from './solds';

const DEV_ENV = { DEV: true } as const;
const PROD_ENV = { DEV: false, VITE_SHOW_EXAMPLE_SOLDS: undefined } as const;

describe('sold range adapter', () => {
  it('locks Charizard SIR to the mock L/M/H, caption, and market tick', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    const range = loadSoldRange(card, 'raw', DEV_ENV)!;
    expect(range.low).toBe(385);
    expect(range.mid).toBe(405);
    expect(range.high).toBe(428);
    expect(range.windowDays).toBe(14);
    expect(range.soldCount).toBe(11);
    expect(soldRangeCaption(range)).toBe('14d · 11 sold · TCGPlayer');
    expect(range.kind).toBe('raw');
    expect(range.example).toBe(true);

    const market = pricesFor(card).tcgplayerUsd?.market;
    expect(market).toBe(412.5);
    expect(rangePercent(412.5, 385, 428)).toBeCloseTo(64, 0);
    expect(formatMoney(market)).toBe('$412.50');
    expect(formatMoney(market)).not.toMatch(/€|EUR/i);
    expect(formatCompactUsd(385)).toBe('$385');
  });

  it('keeps raw and graded series separate and leaves outliers off the tile bar', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    const raw = loadSoldRange(card, 'raw', DEV_ENV)!;
    const graded = loadSoldRange(card, 'graded', DEV_ENV)!;
    expect(raw.sales.every((sale) => sale.kind === 'raw')).toBe(true);
    expect(graded.kind).toBe('graded');
    expect(graded.sales.every((sale) => sale.kind === 'graded')).toBe(true);
    expect(raw.low).toBe(385);
    expect(raw.high).toBe(428);
    expect(raw.sales.some((sale) => sale.outlier && sale.price === 310)).toBe(true);
    expect(raw.low).toBeGreaterThan(310);
  });

  it('dims thin N but still exposes the caption', () => {
    expect(isThinSoldCount(3)).toBe(true);
    expect(isThinSoldCount(11)).toBe(false);
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    const graded = loadSoldRange(card, 'graded', DEV_ENV)!;
    expect(isThinSoldCount(graded.soldCount)).toBe(true);
    expect(soldRangeCaption(graded)).toMatch(/\d+d · \d+ sold · TCGPlayer/);
  });

  it('does not synthesize L/M/H from Market/Mid when a print has no fixture solds', () => {
    const meowth = MOCK_CARDS.find((item) => item.id === 'sv8-227')!;
    expect(loadSoldRange(meowth, 'raw', DEV_ENV)).toBeUndefined();
    expect(pricesFor(meowth).tcgplayerUsd?.market).toBe(12.4);
    expect(pricesFor(meowth)).not.toHaveProperty('cardmarketEur');
  });

  it('hides fixture bars in prod unless VITE_SHOW_EXAMPLE_SOLDS is on', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    expect(exampleSoldsEnabled(PROD_ENV)).toBe(false);
    expect(loadSoldRange(card, 'raw', PROD_ENV)).toBeUndefined();
    expect(loadSoldRange(card, 'raw', { DEV: false, VITE_SHOW_EXAMPLE_SOLDS: 'true' })?.low).toBe(385);
    expect(loadLiveSoldRange(card, 'raw')).toBeUndefined();
  });
});
