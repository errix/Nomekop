import { describe, expect, it } from 'vitest';
import { formsForSpecies } from '../config/real-forms';
import ownedJson from '../data/owned-species.json';
import {
  OWNED_SPECIES_FILE,
  getOwnedSpecies,
  isAnyFormOwned,
  isFormOwned,
  ownershipMarkForPill,
} from './ownedSpecies';

describe('owned-species seed (Eric EXAMPLE collection)', () => {
  it('uses the Delibird top-level shape: version, updatedAt, species[]', () => {
    expect(Object.keys(ownedJson).sort()).toEqual(['species', 'updatedAt', 'version']);
    expect(OWNED_SPECIES_FILE.version).toBe(1);
    expect(OWNED_SPECIES_FILE.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(OWNED_SPECIES_FILE.species)).toBe(true);
    expect(OWNED_SPECIES_FILE.species.length).toBeGreaterThanOrEqual(2);
  });

  it('keeps species.owned in sync with any form flag', () => {
    for (const row of OWNED_SPECIES_FILE.species) {
      expect(row.owned).toBe(Object.values(row.forms).some(Boolean));
      expect(row.acquired).toEqual([]);
    }
  });

  it('uses catalog form ids (not display labels) as form keys', () => {
    for (const row of OWNED_SPECIES_FILE.species) {
      const catalogIds = new Set(formsForSpecies(row.dex).map((form) => form.id));
      for (const formId of Object.keys(row.forms)) {
        expect(catalogIds.has(formId), `${row.key} form "${formId}" is not a catalog id`).toBe(
          true,
        );
      }
    }
  });
});

describe('ownership → D1 rev3 pill mark', () => {
  it('maps Meowth to the mock pattern: Galarian owned; Base / Alolan / Gigantamax empty', () => {
    expect(ownershipMarkForPill(52, 'all')).toBe('owned');
    expect(ownershipMarkForPill(52, 'base')).toBe('unowned');
    expect(ownershipMarkForPill(52, 'alolan')).toBe('unowned');
    expect(ownershipMarkForPill(52, 'galarian')).toBe('owned');
    expect(ownershipMarkForPill(52, 'gigantamax')).toBe('unowned');
    expect(isFormOwned(52, 'galarian')).toBe(true);
    expect(isFormOwned(52, 'base')).toBe(false);
    expect(isAnyFormOwned(52)).toBe(true);
  });

  it('maps Charizard EXAMPLE: Base owned; megas / Gigantamax empty; All forms rollup filled', () => {
    expect(ownershipMarkForPill(6, 'all')).toBe('owned');
    expect(ownershipMarkForPill(6, 'base')).toBe('owned');
    expect(ownershipMarkForPill(6, 'mega-x')).toBe('unowned');
    expect(ownershipMarkForPill(6, 'mega-y')).toBe('unowned');
    expect(ownershipMarkForPill(6, 'gigantamax')).toBe('unowned');
  });

  it('treats a catalog species with no seed row as all-empty (All forms ring)', () => {
    expect(getOwnedSpecies(25)).toBeUndefined();
    expect(isAnyFormOwned(25)).toBe(false);
    expect(ownershipMarkForPill(25, 'all')).toBe('unowned');
    expect(ownershipMarkForPill(25, 'base')).toBe('unowned');
    expect(isFormOwned(25, 'base')).toBe(false);
  });

  it('treats a missing form key as unowned (additive mark, not inferred)', () => {
    expect(ownershipMarkForPill(52, 'hisuian')).toBe('unowned');
    expect(isFormOwned(52, 'hisuian')).toBe(false);
  });

  it('exports the same JSON the loader typed', () => {
    expect(ownedJson).toBe(OWNED_SPECIES_FILE);
  });
});
