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

describe('owned-species seed (Eric’s first acquisitions)', () => {
  it('uses the Delibird top-level shape: version, updatedAt, species[]', () => {
    expect(Object.keys(ownedJson).sort()).toEqual(['species', 'updatedAt', 'version']);
    expect(OWNED_SPECIES_FILE.version).toBe(1);
    expect(OWNED_SPECIES_FILE.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(OWNED_SPECIES_FILE.species)).toBe(true);
    expect(OWNED_SPECIES_FILE.species.length).toBeGreaterThanOrEqual(2);
  });

  it('accepts Delibird’s empty staging draft as a valid top-level document', () => {
    // Exact shape from nomekop-ownership/owned-species.draft.json
    const delibirdDraft = {
      version: 1,
      updatedAt: '2026-09-21T00:32:33-07:00',
      species: [] as unknown[],
    };
    expect(Object.keys(delibirdDraft).sort()).toEqual(Object.keys(ownedJson).sort());
    expect(delibirdDraft.version).toBe(OWNED_SPECIES_FILE.version);
    expect(Array.isArray(delibirdDraft.species)).toBe(true);
    expect(delibirdDraft.species).toEqual([]);
  });

  it('keeps species.owned in sync with any form flag', () => {
    for (const row of OWNED_SPECIES_FILE.species) {
      expect(row.owned).toBe(Object.values(row.forms).some(Boolean));
    }
  });

  it('seeds Suicune, Gengar, and Alolan Exeggutor with real acquired entries', () => {
    expect(ownedJson.species.map((row) => [row.dex, row.key, row.owned])).toEqual([
      [245, 'suicune', true],
      [94, 'gengar', true],
      [103, 'exeggutor', true],
      [486, 'regigigas', true],
      [267, 'beautifly', true],
      [344, 'claydol', true],
      [968, 'orthworm', true],
      [966, 'revavroom', true],
    ]);

    const byDex = Object.fromEntries(ownedJson.species.map((row) => [row.dex, row]));

    expect(byDex[245]?.forms).toEqual({ base: true });
    expect(byDex[245]?.acquired).toEqual([
      { at: '2026-09-21T16:35:07.000Z', raw: 'Suicune' },
    ]);

    expect(byDex[94]?.forms).toEqual({
      base: true,
      mega: false,
      gigantamax: false,
    });
    expect(byDex[94]?.acquired).toEqual([{ at: '2026-09-21T16:35:07.000Z', raw: 'Gengar' }]);

    expect(byDex[103]?.forms).toEqual({ base: false, alolan: true });
    expect(byDex[103]?.acquired).toEqual([
      { at: '2026-09-21T16:35:07.000Z', raw: 'Alolan Exeggutor' },
    ]);

    expect(byDex[486]?.forms).toEqual({ base: true });
    expect(byDex[486]?.acquired).toEqual([
      { at: '2026-09-21T17:42:49.000Z', raw: 'Regigigas' },
    ]);

    expect(byDex[267]?.forms).toEqual({ base: true });
    expect(byDex[267]?.acquired).toEqual([
      { at: '2026-09-21T17:42:49.000Z', raw: 'Beautifly' },
    ]);

    expect(byDex[344]?.forms).toEqual({ base: true });
    expect(byDex[344]?.acquired).toEqual([{ at: '2026-09-21T17:42:49.000Z', raw: 'Claydol' }]);

    expect(byDex[968]?.forms).toEqual({ base: true });
    expect(byDex[968]?.acquired).toEqual([
      { at: '2026-09-22T07:58:47.000Z', raw: 'Orthworm' },
    ]);

    expect(byDex[966]?.forms).toEqual({ base: true });
    expect(byDex[966]?.acquired).toEqual([
      { at: '2026-09-22T07:58:47.000Z', raw: 'Revavroom' },
    ]);
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
  it('maps Suicune: Base owned; All forms rollup filled', () => {
    expect(getOwnedSpecies(245)?.key).toBe('suicune');
    expect(ownershipMarkForPill(245, 'all')).toBe('owned');
    expect(ownershipMarkForPill(245, 'base')).toBe('owned');
    expect(isFormOwned(245, 'base')).toBe(true);
    expect(isAnyFormOwned(245)).toBe(true);
  });

  it('maps Gengar: Base owned; Mega / Gigantamax empty; All forms rollup filled', () => {
    expect(ownershipMarkForPill(94, 'all')).toBe('owned');
    expect(ownershipMarkForPill(94, 'base')).toBe('owned');
    expect(ownershipMarkForPill(94, 'mega')).toBe('unowned');
    expect(ownershipMarkForPill(94, 'gigantamax')).toBe('unowned');
    expect(isFormOwned(94, 'base')).toBe(true);
    expect(isFormOwned(94, 'mega')).toBe(false);
    expect(isAnyFormOwned(94)).toBe(true);
  });

  it('maps Alolan Exeggutor: Alolan owned; Base empty; All forms rollup filled', () => {
    expect(ownershipMarkForPill(103, 'all')).toBe('owned');
    expect(ownershipMarkForPill(103, 'alolan')).toBe('owned');
    expect(ownershipMarkForPill(103, 'base')).toBe('unowned');
    expect(isFormOwned(103, 'alolan')).toBe(true);
    expect(isFormOwned(103, 'base')).toBe(false);
    expect(isAnyFormOwned(103)).toBe(true);
  });

  it('treats a catalog species with no seed row as all-empty (All forms ring)', () => {
    expect(getOwnedSpecies(25)).toBeUndefined();
    expect(isAnyFormOwned(25)).toBe(false);
    expect(ownershipMarkForPill(25, 'all')).toBe('unowned');
    expect(ownershipMarkForPill(25, 'base')).toBe('unowned');
    expect(isFormOwned(25, 'base')).toBe(false);
  });

  it('treats a missing form key as unowned (additive mark, not inferred)', () => {
    expect(ownershipMarkForPill(245, 'mega')).toBe('unowned');
    expect(isFormOwned(245, 'mega')).toBe(false);
  });

  it('exports the same JSON the loader typed', () => {
    expect(ownedJson).toBe(OWNED_SPECIES_FILE);
  });
});
