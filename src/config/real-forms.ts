/**
 * Real Pokémon form facets (Alakazam / Ditto QA).
 * Pills are catalog-driven per National Dex — not by which forms
 * happen to appear in the current art-forward result set.
 *
 * Not forms: Radiant, costumes/owner prints, TAG TEAM, TCG suffixes
 * (V, VSTAR, ex, GX, BREAK, δ) except VMAX → Gigantamax, shiny treatments.
 */

export type RealFormId =
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
  | 'white'
  | 'deoxys-normal'
  | 'deoxys-attack'
  | 'deoxys-defense'
  | 'deoxys-speed'
  | 'therian'
  | 'incarnate';

export type CatalogForm = {
  id: RealFormId;
  label: string;
};

const ALOLAN = new Set([19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 74, 75, 76, 88, 89, 103, 105]);
const GALARIAN = new Set([
  52, 77, 78, 79, 80, 83, 110, 122, 144, 145, 146, 199, 222, 263, 264, 554, 555, 562, 618,
]);
const HISUIAN = new Set([
  58, 59, 100, 101, 157, 211, 215, 503, 549, 570, 571, 628, 705, 706, 713, 724,
]);
const PALDEAN = new Set([128, 194]);

/** Single Mega (not X/Y/Z). */
const MEGA = new Set([
  3, 9, 15, 18, 65, 80, 94, 115, 127, 130, 142, 181, 208, 212, 214, 229, 248, 254, 257, 260,
  282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 359, 362, 373, 376, 380, 381, 384, 428,
  445, 448, 460, 475, 531, 719,
]);

const MEGA_XY = new Set([6, 150]);
/** Legends Z-A Mega Z. Lucario is the confirmed catalog entry. */
const MEGA_Z = new Set([448]);

const GIGANTAMAX = new Set([
  3, 6, 9, 12, 25, 52, 68, 94, 99, 131, 133, 143, 569, 809, 812, 815, 818, 823, 826, 834, 839,
  841, 842, 844, 849, 851, 858, 861, 869, 879, 884, 892,
]);

const PRIMAL = new Set([382, 383]);
const ETERNAMAX = new Set([890]);
const ORIGIN = new Set([483, 484, 487]);
const KYUREM_BW = new Set([646]);
const FORCES_OF_NATURE = new Set([641, 642, 645, 905]);
const DEOXYS = 386;

export function formsForSpecies(dex: number, speciesName: string): CatalogForm[] {
  const forms: CatalogForm[] = [{ id: 'base', label: 'Base' }];

  if (ALOLAN.has(dex)) forms.push({ id: 'alolan', label: 'Alolan' });
  if (GALARIAN.has(dex)) forms.push({ id: 'galarian', label: 'Galarian' });
  if (HISUIAN.has(dex)) forms.push({ id: 'hisuian', label: 'Hisuian' });
  if (PALDEAN.has(dex)) forms.push({ id: 'paldean', label: 'Paldean' });

  if (MEGA_XY.has(dex)) {
    forms.push({ id: 'mega-x', label: `Mega ${speciesName} X` });
    forms.push({ id: 'mega-y', label: `Mega ${speciesName} Y` });
  } else if (MEGA.has(dex)) {
    forms.push({ id: 'mega', label: 'Mega' });
  }
  if (MEGA_Z.has(dex)) forms.push({ id: 'mega-z', label: 'Mega Z' });

  if (GIGANTAMAX.has(dex)) forms.push({ id: 'gigantamax', label: 'Gigantamax' });
  if (PRIMAL.has(dex)) forms.push({ id: 'primal', label: 'Primal' });
  if (ETERNAMAX.has(dex)) forms.push({ id: 'eternamax', label: 'Eternamax' });
  if (ORIGIN.has(dex)) forms.push({ id: 'origin-forme', label: 'Origin Forme' });
  if (KYUREM_BW.has(dex)) {
    forms.push({ id: 'black', label: 'Black' });
    forms.push({ id: 'white', label: 'White' });
  }
  if (FORCES_OF_NATURE.has(dex)) {
    forms.push({ id: 'incarnate', label: 'Incarnate' });
    forms.push({ id: 'therian', label: 'Therian' });
  }
  if (dex === DEOXYS) {
    forms.push(
      { id: 'deoxys-normal', label: 'Normal Forme' },
      { id: 'deoxys-attack', label: 'Attack Forme' },
      { id: 'deoxys-defense', label: 'Defense Forme' },
      { id: 'deoxys-speed', label: 'Speed Forme' },
    );
  }

  return forms;
}

export type FormCard = {
  name?: string;
  subtypes?: string[];
  types?: string[];
};

function displayName(card: FormCard): string {
  return (card.name ?? '').replace(/^Radiant\s+/i, '').replace(/^.+['’]s\s+/i, '').trim();
}

function isMegaCard(card: FormCard): boolean {
  const name = displayName(card);
  const subtypes = card.subtypes ?? [];
  return (
    subtypes.includes('MEGA') ||
    /^Mega\s/i.test(name) ||
    /^M\s/.test(name)
  );
}

function hasRegional(name: string, prefix: string): boolean {
  return name.startsWith(prefix);
}

export function cardMatchesForm(card: FormCard, formId: RealFormId, dex: number): boolean {
  const name = displayName(card);
  const subtypes = card.subtypes ?? [];
  const types = card.types ?? [];

  switch (formId) {
    case 'base':
      return false;
    case 'alolan':
      return hasRegional(name, 'Alolan ');
    case 'galarian':
      return hasRegional(name, 'Galarian ');
    case 'hisuian':
      return hasRegional(name, 'Hisuian ');
    case 'paldean':
      return hasRegional(name, 'Paldean ');
    case 'mega-x':
      if (!isMegaCard(card)) return false;
      if (/\bX\b/.test(name)) return true;
      if (dex === 6) return types.includes('Dragon');
      if (dex === 150) return types.includes('Fighting');
      return false;
    case 'mega-y':
      if (!isMegaCard(card)) return false;
      if (/\bY\b/.test(name)) return true;
      if (/\bX\b/.test(name)) return false;
      if (dex === 6) return !types.includes('Dragon');
      if (dex === 150) return !types.includes('Fighting');
      return false;
    case 'mega-z':
      return isMegaCard(card) && /\bZ\b/.test(name);
    case 'mega':
      if (!isMegaCard(card)) return false;
      if (MEGA_Z.has(dex) && /\bZ\b/.test(name)) return false;
      return true;
    case 'gigantamax': {
      if (!GIGANTAMAX.has(dex)) return false;
      if (/^(Alolan|Galarian|Hisuian|Paldean)\s/i.test(name)) return false;
      return subtypes.includes('VMAX') || /\sVMAX$/i.test(name);
    }
    case 'primal':
      return /^Primal\s/i.test(name);
    case 'eternamax':
      return subtypes.includes('Eternamax') || /Eternamax/i.test(name);
    case 'origin-forme':
      return /Origin Forme/i.test(name);
    case 'black':
      return /^Black\s/i.test(name);
    case 'white':
      return /^White\s/i.test(name);
    case 'incarnate':
      return /Incarnate/i.test(name);
    case 'therian':
      return /Therian/i.test(name);
    case 'deoxys-normal':
      return /Normal Forme/i.test(name);
    case 'deoxys-attack':
      return /Attack Forme/i.test(name);
    case 'deoxys-defense':
      return /Defense Forme/i.test(name);
    case 'deoxys-speed':
      return /Speed Forme/i.test(name);
    default:
      return false;
  }
}

export function assignRealForm(card: FormCard, dex: number, speciesName: string): RealFormId {
  const catalog = formsForSpecies(dex, speciesName);
  for (const form of catalog) {
    if (form.id === 'base') continue;
    if (cardMatchesForm(card, form.id, dex)) return form.id;
  }
  return 'base';
}

export function labelForForm(dex: number, speciesName: string, id: RealFormId | 'all'): string {
  if (id === 'all') return 'All forms';
  return formsForSpecies(dex, speciesName).find((form) => form.id === id)?.label ?? id;
}
