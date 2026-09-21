/**
 * In-repo species ownership (free path).
 * Source of truth: src/data/owned-species.json — Eric’s EXAMPLE collection seed.
 *
 * Delibird write contract (matches staging draft top-level shape):
 *   { version, updatedAt, species[] }
 * After merge, Delibird updates that file via PR — no paid inventory API.
 *
 * D1 rev3: a form is owned when forms[formId] is true
 * (≥1 full-art / illustration of that form). All-forms is a rollup.
 */
import ownedJson from '../data/owned-species.json';

export type OwnershipMark = 'owned' | 'unowned';

export type AcquiredPrint = {
  cardId?: string;
  form?: string;
  at?: string;
};

export type OwnedSpeciesRecord = {
  key: string;
  dex: number;
  owned: boolean;
  forms: Record<string, boolean>;
  acquired: AcquiredPrint[];
};

/** Top-level shape Delibird writes: version + updatedAt + species[]. */
export type OwnedSpeciesFile = {
  version: number;
  updatedAt: string;
  species: OwnedSpeciesRecord[];
};

export const OWNED_SPECIES_FILE = ownedJson as unknown as OwnedSpeciesFile;

const BY_DEX = new Map(
  OWNED_SPECIES_FILE.species.map((row) => [
    row.dex,
    {
      ...row,
      forms: row.forms ?? {},
      acquired: row.acquired ?? [],
      owned: row.owned ?? Object.values(row.forms ?? {}).some(Boolean),
    },
  ]),
);

export function getOwnedSpecies(dex: number): OwnedSpeciesRecord | undefined {
  return BY_DEX.get(dex);
}

/** True when that catalog form flag is explicitly true. Missing key → unowned. */
export function isFormOwned(dex: number, formId: string): boolean {
  return getOwnedSpecies(dex)?.forms[formId] === true;
}

/** All-forms rollup: any form flag true. Species not in the seed → none owned. */
export function isAnyFormOwned(dex: number): boolean {
  const row = getOwnedSpecies(dex);
  if (!row) return false;
  return Object.values(row.forms).some(Boolean);
}

/**
 * D1 rev3 pill mark:
 * - form id → filled ball if that form is owned, else empty ring
 * - `all` → filled ball if any form is owned, else empty ring
 */
export function ownershipMarkForPill(dex: number, formId: 'all' | string): OwnershipMark {
  const owned = formId === 'all' ? isAnyFormOwned(dex) : isFormOwned(dex, formId);
  return owned ? 'owned' : 'unowned';
}
