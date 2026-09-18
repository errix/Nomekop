import {
  FORM_FACETS,
  type FormFacetId,
  NAME_STRIP_PREFIXES,
  NAME_STRIP_SUFFIXES,
  OWNER_POSSESSIVE_PATTERN,
} from '../config/art-forward-taxonomy';

export type { FormFacetId };

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

export function cardFormFacets(card: {
  name?: string;
  subtypes?: string[];
}): FormFacetId[] {
  const name = card.name ?? '';
  const subtypes = card.subtypes ?? [];
  const hits: FormFacetId[] = [];

  for (const facet of FORM_FACETS) {
    const { namePrefix, nameSuffix, subtypes: subMatch } = facet.match;
    const prefixHit = namePrefix?.some((p) => name.startsWith(p)) ?? false;
    const suffixHit = nameSuffix?.some((s) => name.endsWith(s)) ?? false;
    const subtypeHit = subMatch?.some((s) => subtypes.includes(s)) ?? false;
    if (prefixHit || suffixHit || subtypeHit) hits.push(facet.id);
  }

  return hits;
}

export function formatFacetLabel(id: FormFacetId): string {
  const labels: Record<FormFacetId, string> = {
    alolan: 'Alolan',
    galarian: 'Galarian',
    hisuian: 'Hisuian',
    paldean: 'Paldean',
    radiant: 'Radiant',
    mega: 'Mega',
    primal: 'Primal',
    'origin-forme': 'Origin Forme',
    black: 'Black',
    white: 'White',
    vmax: 'VMAX',
    eternamax: 'Eternamax',
    ancient: 'Ancient',
    future: 'Future',
    delta: 'δ',
    break: 'BREAK',
  };
  return labels[id];
}
