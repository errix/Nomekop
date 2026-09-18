/**
 * Real Pokémon form facets, driven by species-forms-catalog-v1.json.
 * Pills come from species[].forms for that dex (including count 0).
 *
 * Not forms: Radiant, costumes/owner prints, TAG TEAM, TCG suffixes
 * except VMAX → Gigantamax.
 */
import catalogJson from '../data/species-forms-catalog-v1.json';

export type FormCard = {
  name?: string;
  subtypes?: string[];
  types?: string[];
};

export type CatalogForm = {
  id: string;
  label: string;
  catalogLabel: string;
};

type CatalogFile = {
  version: number;
  rules: { catalogDriven: boolean; radiantIsForm: boolean; zeroCountPillsVisible: boolean };
  species: { dex: number; name: string; forms: { label: string; sort: number }[] }[];
};

const CATALOG = catalogJson as CatalogFile;

const BY_DEX = new Map(CATALOG.species.map((row) => [row.dex, row]));

export const CATALOG_RULES = CATALOG.rules;
export const CATALOG_VERSION = CATALOG.version;
export const CATALOG_SPECIES_COUNT = CATALOG.species.length;

export function formIdFromLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Eric labels: Mega X/Y → Mega {species} X/Y. Other catalog labels stay as-is. */
export function displayFormLabel(catalogLabel: string, speciesName: string): string {
  if (catalogLabel === 'Mega X') return `Mega ${speciesName} X`;
  if (catalogLabel === 'Mega Y') return `Mega ${speciesName} Y`;
  return catalogLabel;
}

export function formsForSpecies(dex: number, speciesName?: string): CatalogForm[] {
  const row = BY_DEX.get(dex);
  const name = speciesName || row?.name || `Dex ${dex}`;
  const forms = [...(row?.forms ?? [{ label: 'Base', sort: 0 }])].sort((a, b) => a.sort - b.sort);
  return forms.map((form) => ({
    id: formIdFromLabel(form.label),
    catalogLabel: form.label,
    label: displayFormLabel(form.label, name),
  }));
}

function displayName(card: FormCard): string {
  return (card.name ?? '').replace(/^Radiant\s+/i, '').replace(/^.+['’]s\s+/i, '').trim();
}

function isMegaCard(card: FormCard): boolean {
  const name = displayName(card);
  const subtypes = card.subtypes ?? [];
  return subtypes.includes('MEGA') || /^Mega\s/i.test(name) || /^M\s/.test(name);
}

const REGIONAL = ['Alolan', 'Galarian', 'Hisuian', 'Paldean'] as const;

export function cardMatchesCatalogLabel(
  card: FormCard,
  catalogLabel: string,
  dex: number,
  catalog: CatalogForm[],
): boolean {
  const name = displayName(card);
  const subtypes = card.subtypes ?? [];
  const types = card.types ?? [];

  if (catalogLabel === 'Base') return false;

  if (catalogLabel === 'Gigantamax') {
    if (REGIONAL.some((prefix) => name.startsWith(`${prefix} `))) return false;
    return subtypes.includes('VMAX') || /\sVMAX$/i.test(name);
  }
  if (catalogLabel === 'Eternamax') {
    return subtypes.includes('Eternamax') || /Eternamax/i.test(name);
  }
  if (catalogLabel === 'Primal') {
    return /^Primal\s/i.test(name);
  }
  if (catalogLabel === 'Mega X') {
    if (!isMegaCard(card)) return false;
    if (/\bX\b/.test(name) && !/\bY\b/.test(name) && !/\bZ\b/.test(name)) return true;
    if (/\b[YZ]\b/.test(name)) return false;
    if (dex === 6) return types.includes('Dragon');
    if (dex === 150) return types.includes('Fighting');
    return false;
  }
  if (catalogLabel === 'Mega Y') {
    if (!isMegaCard(card)) return false;
    if (/\bY\b/.test(name)) return true;
    if (/\b[XZ]\b/.test(name)) return false;
    if (dex === 6) return isMegaCard(card) && !types.includes('Dragon');
    if (dex === 150) return isMegaCard(card) && !types.includes('Fighting');
    return false;
  }
  if (catalogLabel === 'Mega Z') {
    return isMegaCard(card) && /\bZ\b/.test(name);
  }
  if (catalogLabel.startsWith('Mega ') && catalogLabel !== 'Mega X' && catalogLabel !== 'Mega Y') {
    const rest = catalogLabel.slice('Mega '.length);
    return isMegaCard(card) && name.toLowerCase().includes(rest.toLowerCase());
  }
  if (catalogLabel === 'Mega') {
    if (!isMegaCard(card)) return false;
    const specialized = catalog.filter(
      (form) => form.catalogLabel.startsWith('Mega') && form.catalogLabel !== 'Mega',
    );
    return !specialized.some((form) =>
      cardMatchesCatalogLabel(card, form.catalogLabel, dex, catalog),
    );
  }
  if ((REGIONAL as readonly string[]).includes(catalogLabel)) {
    return name.startsWith(`${catalogLabel} `);
  }

  return nameHasFormToken(name, catalogLabel);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nameHasFormToken(name: string, catalogLabel: string): boolean {
  const token = escapeRegExp(catalogLabel);
  return new RegExp(`(?:^|[^A-Za-z0-9])${token}(?:$|[^A-Za-z0-9])`, 'i').test(name);
}

export function assignRealForm(card: FormCard, dex: number, speciesName?: string): string {
  const catalog = formsForSpecies(dex, speciesName);
  const candidates = catalog
    .filter((form) => form.id !== 'base')
    .sort((a, b) => b.catalogLabel.length - a.catalogLabel.length);
  for (const form of candidates) {
    if (cardMatchesCatalogLabel(card, form.catalogLabel, dex, catalog)) return form.id;
  }
  return 'base';
}

export function labelForForm(dex: number, speciesName: string, id: string): string {
  if (id === 'all') return 'All forms';
  return formsForSpecies(dex, speciesName).find((form) => form.id === id)?.label ?? id;
}
