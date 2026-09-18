import {
  EXCLUDE_RARITIES_UNLESS_GALLERY,
  EXCLUDE_SUPERTYPES,
  GALLERY_SET_ID_PATTERNS,
  GALLERY_SET_IDS,
  HYPER_RARE_POKEMON_ONLY,
  INCLUDE_TRAINER_GALLERY_CARDS,
  INCLUDE_TRAINER_SIR,
  RARITIES_INCLUDE,
  REQUIRE_SUPERTYPE,
} from '../config/art-forward-taxonomy';
import type { TcgCard } from './tcgTypes';

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

const GALLERY_GLOBS = GALLERY_SET_ID_PATTERNS.map(globToRegExp);

export function isGallerySetId(setId: string | undefined): boolean {
  if (!setId) return false;
  if ((GALLERY_SET_IDS as readonly string[]).includes(setId)) return true;
  return GALLERY_GLOBS.some((re) => re.test(setId));
}

export function isExcludedSupertype(supertype: string | undefined): boolean {
  return (EXCLUDE_SUPERTYPES as readonly string[]).includes(supertype ?? '');
}

/**
 * True when a card is an art-forward / illustration-style print.
 * Subtypes (Tera, Ancient, Future, ex, V, …) are never FA signals by themselves.
 */
export function isArtForwardCard(card: TcgCard): boolean {
  if (isExcludedSupertype(card.supertype)) return false;

  const rarity = card.rarity ?? '';
  const gallery = isGallerySetId(card.set?.id);
  const excludedUnlessGallery = (EXCLUDE_RARITIES_UNLESS_GALLERY as readonly string[]).includes(
    rarity,
  );

  if (excludedUnlessGallery && !(gallery && INCLUDE_TRAINER_GALLERY_CARDS)) {
    return false;
  }

  if (rarity === 'Hyper Rare') {
    return HYPER_RARE_POKEMON_ONLY && card.supertype === REQUIRE_SUPERTYPE;
  }

  const listed = (RARITIES_INCLUDE as readonly string[]).includes(rarity);

  if (card.supertype === 'Trainer') {
    if (rarity === 'Special Illustration Rare') return INCLUDE_TRAINER_SIR;
    if (gallery || rarity === 'Trainer Gallery Rare Holo') {
      return INCLUDE_TRAINER_GALLERY_CARDS;
    }
    return false;
  }

  if (listed) return card.supertype === REQUIRE_SUPERTYPE || gallery;

  if (gallery && INCLUDE_TRAINER_GALLERY_CARDS) {
    return card.supertype === REQUIRE_SUPERTYPE || card.supertype === 'Trainer';
  }

  return false;
}

export function belongsToDex(card: TcgCard, dex: number): boolean {
  return (card.nationalPokedexNumbers ?? []).includes(dex);
}

export function filterSpeciesArtForward(cards: TcgCard[], dex: number): TcgCard[] {
  return cards.filter(
    (card) =>
      card.supertype === REQUIRE_SUPERTYPE &&
      belongsToDex(card, dex) &&
      isArtForwardCard(card),
  );
}

export function luceneArtForwardClause(): string {
  const rarityClause = [
    ...RARITIES_INCLUDE.map((r) => `rarity:"${r}"`),
    'rarity:"Hyper Rare"',
    ...GALLERY_SET_IDS.map((id) => `set.id:${id}`),
    ...GALLERY_SET_ID_PATTERNS.map((p) => `set.id:${p}`),
  ].join(' OR ');

  return `(${rarityClause})`;
}

/** Logical species bucket (docs/tests). Live fetches use the dex join key only. */
export function luceneSpeciesQuery(dex: number): string {
  return `nationalPokedexNumbers:${dex} supertype:Pokémon ${luceneArtForwardClause()}`;
}

/** Query actually sent to pokemontcg.io — dex join key, no name wildcard. */
export function luceneDexQuery(dex: number): string {
  return `nationalPokedexNumbers:${dex}`;
}
