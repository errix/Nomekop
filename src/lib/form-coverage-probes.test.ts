import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  FORM_COVERAGE_PROBES,
  NEVER_FORM_PILL_LABELS,
} from '../config/form-coverage-probes';
import { assignRealForm, formsForSpecies } from '../config/real-forms';
import { countFormFilters, formatFormFilterLabel } from './species';
import { getSpeciesByDex } from './pokedex';

const PROBE_MD = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '../config/form-coverage-probes.md'),
  'utf8',
);

function pillLabels(dex: number, name: string): string[] {
  return formsForSpecies(dex, name).map((form) => form.label);
}

function samplePills(dex: number, cards: Parameters<typeof countFormFilters>[0] = []) {
  const counts = countFormFilters(cards, dex);
  return [
    { label: formatFormFilterLabel('all', dex), count: counts.all },
    ...counts.forms.map((form) => ({ label: form.label, count: form.count })),
  ];
}

describe('form-coverage probes (Alakazam)', () => {
  it('bakes the Alakazam probe markdown into the repo', () => {
    expect(PROBE_MD).toContain('Charizard (6)');
    expect(PROBE_MD).toContain('Deoxys (386)');
    expect(PROBE_MD).toContain('Weedle (13)');
    expect(PROBE_MD).toContain('Pikachu (25)');
    expect(PROBE_MD).toMatch(/Radiant never a pill/i);
  });

  it('shows every required probe pill at count 0 (catalog-driven, not result-driven)', () => {
    for (const probe of FORM_COVERAGE_PROBES) {
      const labels = pillLabels(probe.dex, probe.name);
      const empty = countFormFilters([], probe.dex);
      expect(empty.all).toBe(0);
      expect(empty.forms.every((form) => form.count === 0)).toBe(true);
      for (const required of probe.requiredLabels) {
        expect(labels, `${probe.name} missing ${required}`).toContain(required);
        expect(empty.forms.map((form) => form.label)).toContain(required);
      }
      if (probe.exactLabels) {
        expect(labels).toEqual([...probe.exactLabels]);
        expect(empty.forms.map((form) => form.label)).toEqual([...probe.exactLabels]);
      }
      expect(labels.some((label) => (NEVER_FORM_PILL_LABELS as readonly string[]).includes(label))).toBe(
        false,
      );
    }
  });

  it('assigns probe TCG signals to the catalog form ids', () => {
    for (const probe of FORM_COVERAGE_PROBES) {
      for (const signal of probe.signals ?? []) {
        expect(
          assignRealForm(
            { name: signal.name, subtypes: signal.subtypes, types: signal.types },
            probe.dex,
            probe.name,
          ),
          `${probe.name}: ${signal.name}`,
        ).toBe(signal.formId);
      }
    }
  });

  it('must-pass: Charizard Base / Mega X / Mega Y / Gigantamax; Radiant is not a pill', () => {
    const prints = [
      { name: 'Charizard' },
      { name: 'Radiant Charizard' },
      { name: 'Mega Charizard X ex', subtypes: ['MEGA', 'ex'], types: ['Fire', 'Dragon'] },
      { name: 'M Charizard-EX', subtypes: ['MEGA'], types: ['Fire', 'Dragon'] },
      { name: 'Mega Charizard Y ex', subtypes: ['MEGA', 'ex'], types: ['Fire'] },
      { name: 'Charizard VMAX', subtypes: ['VMAX'] },
    ];
    const pills = samplePills(6, prints);
    expect(pills.map((p) => p.label)).toEqual([
      'All forms',
      'Base',
      'Mega Charizard X',
      'Mega Charizard Y',
      'Gigantamax',
    ]);
    expect(pills.find((p) => p.label === 'Base')?.count).toBe(2);
    expect(pills.find((p) => p.label === 'Mega Charizard X')?.count).toBe(2);
    expect(pills.find((p) => p.label === 'Mega Charizard Y')?.count).toBe(1);
    expect(pills.find((p) => p.label === 'Gigantamax')?.count).toBe(1);
    expect(pills.some((p) => p.label === 'Radiant')).toBe(false);
  });

  it('must-pass: Meowth Base / Alolan / Galarian / Gigantamax', () => {
    const prints = [
      { name: 'Meowth' },
      { name: 'Alolan Meowth' },
      { name: 'Galarian Meowth' },
      { name: 'Meowth VMAX', subtypes: ['VMAX'] },
    ];
    const pills = samplePills(52, prints);
    expect(pills.map((p) => `${p.label} ${p.count}`)).toEqual([
      'All forms 4',
      'Base 1',
      'Alolan 1',
      'Galarian 1',
      'Gigantamax 1',
    ]);
  });

  it('must-pass: Deoxys four Formes (Base = Normal)', () => {
    const pills = samplePills(386);
    expect(pills.map((p) => `${p.label} ${p.count}`)).toEqual([
      'All forms 0',
      'Base 0',
      'Attack Forme 0',
      'Defense Forme 0',
      'Speed Forme 0',
    ]);
  });

  it('must-pass: Weedle is Base-only', () => {
    expect(samplePills(13).map((p) => `${p.label} ${p.count}`)).toEqual([
      'All forms 0',
      'Base 0',
    ]);
  });

  it('must-pass: Pikachu negative — no costume/owner pills', () => {
    const prints = [
      { name: 'Pikachu' },
      { name: 'Detective Pikachu' },
      { name: 'Flying Pikachu' },
      { name: "Ash's Pikachu" },
    ];
    const pills = samplePills(25, prints);
    expect(pills.map((p) => p.label)).toEqual(['All forms', 'Base', 'Gigantamax']);
    expect(pills.find((p) => p.label === 'Gigantamax')?.count).toBe(0);
    expect(pills.find((p) => p.label === 'Base')?.count).toBe(4);
    expect(pills.some((p) => /detective|flying|ash|costume/i.test(p.label))).toBe(false);
  });

  it('keeps Raichu Mega X/Y pills at 0 and does not treat Clodsire as Wooper', () => {
    const raichu = samplePills(26, [{ name: 'Raichu' }, { name: 'Alolan Raichu' }]);
    expect(raichu.map((p) => `${p.label} ${p.count}`)).toEqual([
      'All forms 2',
      'Base 1',
      'Alolan 1',
      'Mega Raichu X 0',
      'Mega Raichu Y 0',
    ]);
    expect(pillLabels(194, 'Wooper')).toEqual(['Base', 'Paldean']);
    expect(getSpeciesByDex(980)?.name).toBe('Clodsire');
    expect(pillLabels(194, 'Wooper')).not.toContain('Clodsire');
  });

  it('keeps Lucario Mega Z at 0 without matching plain Mega cards', () => {
    const pills = samplePills(448, [
      { name: 'Lucario' },
      { name: 'Mega Lucario ex', subtypes: ['MEGA', 'ex'] },
      { name: 'M Lucario-EX', subtypes: ['MEGA'] },
    ]);
    expect(pills.map((p) => `${p.label} ${p.count}`)).toEqual([
      'All forms 3',
      'Base 1',
      'Mega 2',
      'Mega Z 0',
    ]);
  });
});
