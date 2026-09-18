/**
 * Alakazam / Ditto form-coverage probe list.
 * Source: src/config/form-coverage-probes.md
 *
 * Required pills must appear even at count 0. Catalog may add extra real
 * forms. Costume / owner / Radiant names must never become pills.
 */
export type ProbeSignal = {
  name: string;
  subtypes?: string[];
  types?: string[];
  formId: string;
};

export type FormCoverageProbe = {
  dex: number;
  name: string;
  /** Labels that MUST appear (empty-result count 0 still shows them). */
  requiredLabels: readonly string[];
  /** When set, the catalog pill list must match exactly. */
  exactLabels?: readonly string[];
  signals?: readonly ProbeSignal[];
  notes?: string;
};

export const NEVER_FORM_PILL_LABELS = [
  'Radiant',
  'Detective',
  'Costume',
  'Flying',
  'Ash',
  'TAG TEAM',
  'Shiny',
] as const;

export const FORM_COVERAGE_PROBES: readonly FormCoverageProbe[] = [
  {
    dex: 6,
    name: 'Charizard',
    requiredLabels: ['Base', 'Mega Charizard X', 'Mega Charizard Y', 'Gigantamax'],
    exactLabels: ['Base', 'Mega Charizard X', 'Mega Charizard Y', 'Gigantamax'],
    signals: [
      { name: 'Charizard', formId: 'base' },
      { name: 'Charizard ex', subtypes: ['ex'], formId: 'base' },
      { name: 'Radiant Charizard', formId: 'base' },
      {
        name: 'Mega Charizard X ex',
        subtypes: ['MEGA', 'ex'],
        types: ['Fire', 'Dragon'],
        formId: 'mega-x',
      },
      {
        name: 'M Charizard-EX',
        subtypes: ['MEGA'],
        types: ['Fire', 'Dragon'],
        formId: 'mega-x',
      },
      {
        name: 'Mega Charizard Y ex',
        subtypes: ['MEGA', 'ex'],
        types: ['Fire'],
        formId: 'mega-y',
      },
      {
        name: 'M Charizard-EX',
        subtypes: ['MEGA'],
        types: ['Fire'],
        formId: 'mega-y',
      },
      { name: 'Charizard VMAX', subtypes: ['VMAX'], formId: 'gigantamax' },
    ],
  },
  {
    dex: 52,
    name: 'Meowth',
    requiredLabels: ['Base', 'Alolan', 'Galarian', 'Gigantamax'],
    exactLabels: ['Base', 'Alolan', 'Galarian', 'Gigantamax'],
    signals: [
      { name: 'Meowth', formId: 'base' },
      { name: 'Alolan Meowth', formId: 'alolan' },
      { name: 'Galarian Meowth', formId: 'galarian' },
      { name: 'Meowth VMAX', subtypes: ['VMAX'], formId: 'gigantamax' },
    ],
  },
  {
    dex: 26,
    name: 'Raichu',
    requiredLabels: ['Base', 'Alolan', 'Mega Raichu X', 'Mega Raichu Y'],
    exactLabels: ['Base', 'Alolan', 'Mega Raichu X', 'Mega Raichu Y'],
    notes: 'Z-A Mega Dimension; Mega X/Y stay visible at count 0.',
  },
  {
    dex: 38,
    name: 'Ninetales',
    requiredLabels: ['Base', 'Alolan'],
    exactLabels: ['Base', 'Alolan'],
  },
  {
    dex: 549,
    name: 'Lilligant',
    requiredLabels: ['Base', 'Hisuian'],
    exactLabels: ['Base', 'Hisuian'],
  },
  {
    dex: 194,
    name: 'Wooper',
    requiredLabels: ['Base', 'Paldean'],
    exactLabels: ['Base', 'Paldean'],
    notes: 'Clodsire is a separate dex — not a Wooper form pill.',
  },
  {
    dex: 128,
    name: 'Tauros',
    requiredLabels: ['Base', 'Combat', 'Blaze', 'Aqua'],
    exactLabels: ['Base', 'Combat', 'Blaze', 'Aqua'],
    notes: 'Paldean breeds encoded as Combat/Blaze/Aqua (no umbrella Paldean pill).',
  },
  {
    dex: 386,
    name: 'Deoxys',
    requiredLabels: ['Base', 'Attack Forme', 'Defense Forme', 'Speed Forme'],
    exactLabels: ['Base', 'Attack Forme', 'Defense Forme', 'Speed Forme'],
    notes: 'Base stands in for Normal Forme (catalog always-Base rule).',
    signals: [
      { name: 'Deoxys', formId: 'base' },
      { name: 'Deoxys Normal Forme', formId: 'base' },
      { name: 'Deoxys Attack Forme', formId: 'attack-forme' },
      { name: 'Deoxys Defense Forme', formId: 'defense-forme' },
      { name: 'Deoxys Speed Forme', formId: 'speed-forme' },
    ],
  },
  {
    dex: 646,
    name: 'Kyurem',
    requiredLabels: ['Base', 'Black', 'White'],
    exactLabels: ['Base', 'Black', 'White'],
  },
  {
    dex: 645,
    name: 'Landorus',
    requiredLabels: ['Base', 'Therian'],
    exactLabels: ['Base', 'Therian'],
    notes:
      'Incarnate maps to Base. Therian/Incarnate often absent from English TCG names (catalog dataGap).',
  },
  {
    dex: 892,
    name: 'Urshifu',
    requiredLabels: ['Base', 'Rapid Strike'],
    notes: 'Base stands in for Single Strike Style. Gigantamax is an extra catalog form.',
    signals: [
      { name: 'Urshifu', formId: 'base' },
      { name: 'Single Strike Urshifu', formId: 'base' },
      { name: 'Rapid Strike Urshifu', formId: 'rapid-strike' },
    ],
  },
  {
    dex: 25,
    name: 'Pikachu',
    requiredLabels: ['Base', 'Gigantamax'],
    exactLabels: ['Base', 'Gigantamax'],
    notes: 'NEGATIVE: costume/owner names must not become pills.',
    signals: [
      { name: 'Pikachu', formId: 'base' },
      { name: 'Detective Pikachu', formId: 'base' },
      { name: 'Flying Pikachu', formId: 'base' },
      { name: "Ash's Pikachu", formId: 'base' },
      { name: 'Pikachu VMAX', subtypes: ['VMAX'], formId: 'gigantamax' },
    ],
  },
  {
    dex: 890,
    name: 'Eternatus',
    requiredLabels: ['Base', 'Eternamax'],
    exactLabels: ['Base', 'Eternamax'],
  },
  {
    dex: 13,
    name: 'Weedle',
    requiredLabels: ['Base'],
    exactLabels: ['Base'],
  },
  {
    dex: 448,
    name: 'Lucario',
    requiredLabels: ['Base', 'Mega', 'Mega Z'],
    exactLabels: ['Base', 'Mega', 'Mega Z'],
    notes: 'Mega Z is a real form stub (count 0). Plain Mega must not match Mega Z.',
    signals: [
      { name: 'Lucario', formId: 'base' },
      { name: 'Mega Lucario ex', subtypes: ['MEGA', 'ex'], formId: 'mega' },
      { name: 'M Lucario-EX', subtypes: ['MEGA'], formId: 'mega' },
      { name: 'Mega Lucario Z ex', subtypes: ['MEGA', 'ex'], formId: 'mega-z' },
    ],
  },
];
