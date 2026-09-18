/**
 * specialArtPromo: curated UPC / collection special-art Black Star promos.
 * Source of truth: src/data/special-art-promos-seed-v1.json (Alakazam v1, 43 ids).
 *
 * Include when card.id ∈ ids OR the existing rarity/gallery net already passes.
 * Not all Promos.
 */
import seedJson from '../data/special-art-promos-seed-v1.json';

export type SpecialArtPromoGap = {
  id: string;
  reason: string;
};

export type SpecialArtPromoSeed = {
  version: number;
  purpose: string;
  rules: { match: string; notAllPromos: boolean };
  mustInclude: string[];
  ids: string[];
  meta: { count: number; gaps: SpecialArtPromoGap[] };
};

export const SPECIAL_ART_PROMO_SEED = seedJson as SpecialArtPromoSeed;

export const SPECIAL_ART_PROMO_IDS: ReadonlySet<string> = new Set(SPECIAL_ART_PROMO_SEED.ids);

export function isSpecialArtPromoId(id: string | undefined): boolean {
  return Boolean(id && SPECIAL_ART_PROMO_IDS.has(id));
}
