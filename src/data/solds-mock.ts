/**
 * Example recent solds — not live comps.
 * Charizard sv3pt5-199 raw L/M/H is locked to the Eric/Smeargle mock
 * ($385 / $405 / $428, 14d · 11 sold). Outliers stay off the tile bar.
 */
import type { SoldSale } from '../lib/solds';

export const MOCK_SOLDS: Record<string, SoldSale[]> = {
  'sv3pt5-199': [
    { price: 385, date: '2026-09-05', kind: 'raw' },
    { price: 388, date: '2026-09-06', kind: 'raw' },
    { price: 394, date: '2026-09-07', kind: 'raw' },
    { price: 399, date: '2026-09-08', kind: 'raw' },
    { price: 402, date: '2026-09-09', kind: 'raw' },
    { price: 405, date: '2026-09-10', kind: 'raw' },
    { price: 407, date: '2026-09-11', kind: 'raw' },
    { price: 411, date: '2026-09-12', kind: 'raw' },
    { price: 418, date: '2026-09-13', kind: 'raw' },
    { price: 422, date: '2026-09-14', kind: 'raw' },
    { price: 428, date: '2026-09-16', kind: 'raw' },
    { price: 310, date: '2026-09-04', kind: 'raw', outlier: true },
    { price: 540, date: '2026-09-15', kind: 'raw', outlier: true },
    { price: 620, date: '2026-09-12', kind: 'graded' },
    { price: 640, date: '2026-09-14', kind: 'graded' },
    { price: 655, date: '2026-09-17', kind: 'graded' },
  ],
};
