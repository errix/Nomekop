/**
 * Slice 1 art-forward taxonomy, baked from
 * `art-forward-taxonomy.schema.json` (NomekopArtForwardTaxonomy v1).
 *
 * Species buckets join on nationalPokedexNumbers and always require
 * supertype "Pokémon". Name prefixes/suffixes are facets only — never
 * the species join key.
 */
export const TAXONOMY_VERSION = 1 as const;

export const SPECIES_JOIN_KEY = 'nationalPokedexNumbers' as const;
export const REQUIRE_SUPERTYPE = 'Pokémon' as const;

export const NAME_STRIP_PREFIXES = [
  'Alolan ',
  'Galarian ',
  'Hisuian ',
  'Paldean ',
  'Radiant ',
  'Primal ',
  'Origin Forme ',
  'Black ',
  'White ',
  'Mega ',
  'M ',
] as const;

export const NAME_STRIP_SUFFIXES = [
  '-EX',
  '-GX',
  ' VMAX',
  ' VSTAR',
  ' V',
  ' ex',
  ' BREAK',
  ' δ',
  ' Normal Forme',
  ' Attack Forme',
  ' Defense Forme',
  ' Speed Forme',
] as const;

/** Regex hint for Team Rocket's / Giovanni's / Rocket's style names. */
export const OWNER_POSSESSIVE_PATTERN = "^.+['’]s\\s+";

/** Real Pokémon forms only. Radiant / VMAX-as-label / TCG suffixes are not facets. */
export type FormFacetId =
  | 'base'
  | 'alolan'
  | 'galarian'
  | 'hisuian'
  | 'paldean'
  | 'mega'
  | 'mega-x'
  | 'mega-y'
  | 'mega-z'
  | 'gigantamax'
  | 'primal'
  | 'eternamax'
  | 'origin-forme'
  | 'black'
  | 'white';

export type FormFacetMatch = {
  namePrefix?: readonly string[];
  nameSuffix?: readonly string[];
  subtypes?: readonly string[];
};

export type FormFacet = {
  id: FormFacetId;
  match: FormFacetMatch;
};

export const FORM_FACETS: readonly FormFacet[] = [
  { id: 'alolan', match: { namePrefix: ['Alolan '] } },
  { id: 'galarian', match: { namePrefix: ['Galarian '] } },
  { id: 'hisuian', match: { namePrefix: ['Hisuian '] } },
  { id: 'paldean', match: { namePrefix: ['Paldean '] } },
  { id: 'mega', match: { namePrefix: ['M ', 'Mega '], subtypes: ['MEGA'] } },
  { id: 'mega-x', match: { namePrefix: ['Mega '], nameSuffix: [' X', ' X ex'] } },
  { id: 'mega-y', match: { namePrefix: ['Mega '], nameSuffix: [' Y', ' Y ex'] } },
  { id: 'mega-z', match: { namePrefix: ['Mega '], nameSuffix: [' Z', ' Z ex'] } },
  { id: 'gigantamax', match: { nameSuffix: [' VMAX'], subtypes: ['VMAX'] } },
  { id: 'primal', match: { namePrefix: ['Primal '] } },
  { id: 'origin-forme', match: { namePrefix: ['Origin Forme '] } },
  { id: 'black', match: { namePrefix: ['Black '] } },
  { id: 'white', match: { namePrefix: ['White '] } },
  { id: 'eternamax', match: { subtypes: ['Eternamax'] } },
] as const;

export const SPECIES_NOTES = [
  'Therian/Incarnate not encoded in English name — dex-only bucket',
  'Gigantamax not in name — VMAX/Eternamax stand-in',
  'Costume renames (e.g. Detective Pikachu) — prefer dex over fuzzy name',
  'TAG TEAM: multiple nationalPokedexNumbers',
] as const;

/** Exact pokemontcg.io rarity strings. Hyper Rare is gated separately. */
export const RARITIES_INCLUDE = [
  'Illustration Rare',
  'Special Illustration Rare',
  'Amazing Rare',
  'Radiant Rare',
  'Rare Ultra',
  'Ultra Rare',
  'Rare Rainbow',
  'Rare Secret',
  'Trainer Gallery Rare Holo',
  'Shiny Rare',
  'Shiny Ultra Rare',
  'Rare Shiny',
  'Rare Shiny GX',
  'Mega Hyper Rare',
] as const;

export const HYPER_RARE_POKEMON_ONLY = true as const;

export const GALLERY_SET_IDS = [
  'swsh9tg',
  'swsh10tg',
  'swsh11tg',
  'swsh12tg',
  'swsh12pt5gg',
] as const;

export const GALLERY_SET_ID_PATTERNS = ['*tg', '*gg'] as const;

export const INCLUDE_TRAINER_SIR = true as const;
export const INCLUDE_TRAINER_GALLERY_CARDS = true as const;

export const EXCLUDE_SUPERTYPES = ['Energy'] as const;

export const EXCLUDE_RARITIES_UNLESS_GALLERY = [
  'Common',
  'Uncommon',
  'Rare',
  'Rare Holo',
  'Double Rare',
  'Promo',
] as const;

export const DO_NOT_USE_SUBTYPES_ALONE = [
  'Tera',
  'Single Strike',
  'Rapid Strike',
  'Fusion Strike',
  'Ancient',
  'Future',
  'ex',
  'V',
  'VMAX',
  'VSTAR',
] as const;

export const DEFERRED_PENDING_ERIC = [
  'Classic Collection',
  'Promo alt arts',
  'Treat all Rare Holo V/VMAX/VSTAR as chase',
  'MEGA_ATTACK_RARE / Futuristic Rare / Black White Rare after live sample',
] as const;

export const TAXONOMY = {
  version: TAXONOMY_VERSION,
  species: {
    joinKey: SPECIES_JOIN_KEY,
    requireSupertype: REQUIRE_SUPERTYPE,
    nameNormalize: {
      stripPrefixes: NAME_STRIP_PREFIXES,
      stripSuffixes: NAME_STRIP_SUFFIXES,
      ownerPossessivePattern: OWNER_POSSESSIVE_PATTERN,
      formFacets: FORM_FACETS,
      notes: SPECIES_NOTES,
    },
  },
  artForward: {
    raritiesInclude: RARITIES_INCLUDE,
    hyperRarePokémonOnly: HYPER_RARE_POKEMON_ONLY,
    gallerySetIds: GALLERY_SET_IDS,
    gallerySetIdPatterns: GALLERY_SET_ID_PATTERNS,
    includeTrainerSir: INCLUDE_TRAINER_SIR,
    includeTrainerGalleryCards: INCLUDE_TRAINER_GALLERY_CARDS,
    exclude: {
      supertypes: EXCLUDE_SUPERTYPES,
      raritiesUnlessGallery: EXCLUDE_RARITIES_UNLESS_GALLERY,
      doNotUseSubtypesAlone: DO_NOT_USE_SUBTYPES_ALONE,
    },
    deferredPendingEric: DEFERRED_PENDING_ERIC,
  },
} as const;

export type NomekopArtForwardTaxonomy = typeof TAXONOMY;
