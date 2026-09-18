/**
 * Alakazam / Ditto form-coverage probe list.
 * Pills must come from the catalog for that dex, including count 0.
 * Costume / owner / Radiant names must never become pills.
 */
export type FormCoverageProbe = {
  dex: number;
  name: string;
  labels: readonly string[];
};

export const FORM_COVERAGE_PROBES: readonly FormCoverageProbe[] = [
  {
    dex: 6,
    name: 'Charizard',
    labels: ['Base', 'Mega Charizard X', 'Mega Charizard Y', 'Gigantamax'],
  },
  { dex: 13, name: 'Weedle', labels: ['Base'] },
  { dex: 25, name: 'Pikachu', labels: ['Base', 'Gigantamax'] },
  {
    dex: 26,
    name: 'Raichu',
    labels: ['Base', 'Alolan', 'Mega Raichu X', 'Mega Raichu Y'],
  },
  {
    dex: 52,
    name: 'Meowth',
    labels: ['Base', 'Alolan', 'Galarian', 'Gigantamax'],
  },
  { dex: 150, name: 'Mewtwo', labels: ['Base', 'Mega Mewtwo X', 'Mega Mewtwo Y'] },
  { dex: 359, name: 'Absol', labels: ['Base', 'Mega', 'Mega Z'] },
  {
    dex: 386,
    name: 'Deoxys',
    labels: ['Base', 'Attack Forme', 'Defense Forme', 'Speed Forme'],
  },
  { dex: 445, name: 'Garchomp', labels: ['Base', 'Mega', 'Mega Z'] },
  { dex: 448, name: 'Lucario', labels: ['Base', 'Mega', 'Mega Z'] },
  { dex: 641, name: 'Tornadus', labels: ['Base', 'Therian'] },
  { dex: 890, name: 'Eternatus', labels: ['Base', 'Eternamax'] },
  {
    dex: 892,
    name: 'Urshifu',
    labels: ['Base', 'Rapid Strike', 'Gigantamax'],
  },
];

export const NEVER_FORM_PILL_LABELS = [
  'Radiant',
  'Detective',
  'Costume',
  'Flying',
  'Ash',
  'TAG TEAM',
] as const;
