import { describe, expect, it } from 'vitest';
import { MOCK_CARDS } from '../data/mockCards';
import { formatMoney, pricesFor } from './tcgTypes';
import {
  formatCompactUsd,
  isThinSoldCount,
  loadSoldRange,
  rangePercent,
} from './solds';

describe('sold range adapter', () => {
  it('locks Charizard SIR to the mock L/M/H, caption, and market tick', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    const range = loadSoldRange(card, 'raw')!;
    expect(range.low).toBe(385);
    expect(range.mid).toBe(405);
    expect(range.high).toBe(428);
    expect(range.windowDays).toBe(14);
    expect(range.soldCount).toBe(11);
    expect(`${range.windowDays}d · ${range.soldCount} sold`).toBe('14d · 11 sold');
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
    const raw = loadSoldRange(card, 'raw')!;
    const graded = loadSoldRange(card, 'graded')!;
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
    const graded = loadSoldRange(card, 'graded')!;
    expect(isThinSoldCount(graded.soldCount)).toBe(true);
    expect(`${graded.windowDays}d · ${graded.soldCount} sold`).toMatch(/\d+d · \d+ sold/);
  });

  it('still builds an example bar for other prints from TCGPlayer USD', () => {
    const meowth = MOCK_CARDS.find((item) => item.id === 'sv8-227')!;
    const range = loadSoldRange(meowth, 'raw');
    expect(range).toBeDefined();
    expect(range?.example).toBe(true);
    expect(range?.kind).toBe('raw');
    expect(pricesFor(meowth)).not.toHaveProperty('cardmarketEur');
  });
});
