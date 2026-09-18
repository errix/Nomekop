import { describe, expect, it } from 'vitest';
import { assignRealForm, formsForSpecies } from '../config/real-forms';
import { resolveSpecies } from './pokedex';
import { countFormFilters } from './species';

describe('Raichu (dex 26) catalog forms', () => {
  it('always exposes Base / Alolan / Mega Raichu X / Mega Raichu Y', () => {
    expect(formsForSpecies(26, 'Raichu').map((form) => form.label)).toEqual([
      'Base',
      'Alolan',
      'Mega Raichu X',
      'Mega Raichu Y',
    ]);
    const empty = countFormFilters([], 26);
    expect(empty.forms.map((form) => `${form.label} ${form.count}`)).toEqual([
      'Base 0',
      'Alolan 0',
      'Mega Raichu X 0',
      'Mega Raichu Y 0',
    ]);
  });

  it('keeps Mega X/Y pills at 0 when only Base and Alolan prints exist', () => {
    const counts = countFormFilters(
      [{ name: 'Raichu' }, { name: 'Alolan Raichu' }],
      26,
    );
    expect(counts.forms.map((form) => `${form.label} ${form.count}`)).toEqual([
      'Base 1',
      'Alolan 1',
      'Mega Raichu X 0',
      'Mega Raichu Y 0',
    ]);
    expect(assignRealForm({ name: 'Raichu' }, 26, 'Raichu')).toBe('base');
    expect(assignRealForm({ name: 'Alolan Raichu' }, 26, 'Raichu')).toBe('alolan');
  });

  it('maps future Z-A Mega names without stripping the pills', () => {
    expect(
      assignRealForm({ name: 'Mega Raichu X ex', subtypes: ['MEGA', 'ex'] }, 26, 'Raichu'),
    ).toBe('mega-x');
    expect(
      assignRealForm({ name: 'Mega Raichu Y ex', subtypes: ['MEGA', 'ex'] }, 26, 'Raichu'),
    ).toBe('mega-y');
    expect(resolveSpecies('Mega Raichu X')?.n).toBe(26);
    expect(resolveSpecies('Mega Raichu Y')?.n).toBe(26);
  });
});
