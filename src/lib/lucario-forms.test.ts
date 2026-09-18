import { describe, expect, it } from 'vitest';
import { assignRealForm, formsForSpecies } from '../config/real-forms';
import { resolveSpecies } from './pokedex';
import { countFormFilters } from './species';

describe('Lucario (dex 448) catalog forms', () => {
  it('always exposes Base / Mega / Mega Z, including Mega Z at count 0', () => {
    expect(formsForSpecies(448, 'Lucario').map((form) => form.label)).toEqual([
      'Base',
      'Mega',
      'Mega Z',
    ]);
    const empty = countFormFilters([], 448);
    expect(empty.forms.map((form) => `${form.label} ${form.count}`)).toEqual([
      'Base 0',
      'Mega 0',
      'Mega Z 0',
    ]);
  });

  it('maps TCG Mega cards to Mega and never to the Mega Z stub', () => {
    expect(assignRealForm({ name: 'M Lucario-EX', subtypes: ['MEGA'] }, 448, 'Lucario')).toBe(
      'mega',
    );
    expect(
      assignRealForm({ name: 'Mega Lucario ex', subtypes: ['MEGA', 'ex'] }, 448, 'Lucario'),
    ).toBe('mega');
    const counts = countFormFilters(
      [
        { name: 'M Lucario-EX', subtypes: ['MEGA'] },
        { name: 'Mega Lucario ex', subtypes: ['MEGA', 'ex'] },
      ],
      448,
    );
    expect(counts.forms.find((form) => form.label === 'Mega')?.count).toBe(2);
    expect(counts.forms.find((form) => form.label === 'Mega Z')?.count).toBe(0);
  });

  it('only assigns Mega Z when the name is a Z Mega Evolution', () => {
    expect(
      assignRealForm({ name: 'Mega Lucario Z', subtypes: ['MEGA'] }, 448, 'Lucario'),
    ).toBe('mega-z');
    expect(
      assignRealForm({ name: 'Mega Lucario Z ex', subtypes: ['MEGA', 'ex'] }, 448, 'Lucario'),
    ).toBe('mega-z');
    expect(resolveSpecies('Mega Lucario Z')?.n).toBe(448);
  });
});
