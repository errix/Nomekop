import {
  NAME_STRIP_PREFIXES,
  NAME_STRIP_SUFFIXES,
  OWNER_POSSESSIVE_PATTERN,
} from '../config/art-forward-taxonomy';
import {
  assignRealForm,
  formsForSpecies,
  labelForForm,
  type CatalogForm,
  type FormCard,
} from '../config/real-forms';
import { getSpeciesByDex } from './pokedex';

export type FormFilter = string;

const OWNER_RE = new RegExp(OWNER_POSSESSIVE_PATTERN, 'i');

export function stripOwnerPrefix(name: string): string {
  return name.replace(OWNER_RE, '');
}

function longestFirst(values: readonly string[]): string[] {
  return [...values].sort((a, b) => b.length - a.length);
}

/** Strip regional / mega / combat tokens so a typed name can resolve to a dex. */
export function normalizeSpeciesToken(raw: string): string {
  let name = raw.trim().replace(/\s+/g, ' ');
  name = stripOwnerPrefix(name);

  for (const prefix of longestFirst(NAME_STRIP_PREFIXES)) {
    if (name.toLowerCase().startsWith(prefix.toLowerCase())) {
      name = name.slice(prefix.length);
      break;
    }
  }

  for (const suffix of longestFirst(NAME_STRIP_SUFFIXES)) {
    if (name.toLowerCase().endsWith(suffix.toLowerCase())) {
      name = name.slice(0, -suffix.length);
      break;
    }
  }

  return name.replace(/\s+/g, ' ').trim();
}

export function foldName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[♀]/g, 'f')
    .replace(/[♂]/g, 'm')
    .replace(/['’.:]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function speciesNameForDex(dex: number): string {
  return getSpeciesByDex(dex)?.name ?? `Dex ${dex}`;
}

export function catalogForDex(dex: number): CatalogForm[] {
  return formsForSpecies(dex, speciesNameForDex(dex));
}

export function assignCardForm(card: FormCard, dex: number): string {
  return assignRealForm(card, dex, speciesNameForDex(dex));
}

/** @deprecated Prefer assignCardForm — kept for row chips of a known dex. */
export function cardFormFacets(card: FormCard, dex: number): string[] {
  const id = assignCardForm(card, dex);
  return id === 'base' ? [] : [id];
}

export function isBaseFormCard(card: FormCard, dex: number): boolean {
  return assignCardForm(card, dex) === 'base';
}

export type FormPillCount = CatalogForm & { count: number };

/** Catalog-driven counts: every real form for the dex, including zeros. */
export function countFormFilters(cards: FormCard[], dex: number): {
  all: number;
  forms: FormPillCount[];
} {
  const catalog = catalogForDex(dex);
  const counts = new Map<string, number>(catalog.map((form) => [form.id, 0]));
  for (const card of cards) {
    const id = assignCardForm(card, dex);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return {
    all: cards.length,
    forms: catalog.map((form) => ({ ...form, count: counts.get(form.id) ?? 0 })),
  };
}

export function formatFormFilterLabel(id: FormFilter, dex: number): string {
  return labelForForm(dex, speciesNameForDex(dex), id);
}
