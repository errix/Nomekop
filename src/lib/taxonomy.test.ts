import { describe, expect, it } from 'vitest';
import { TAXONOMY } from '../config/art-forward-taxonomy';
import { MOCK_CARDS } from '../data/mockCards';
import {
  belongsToDex,
  filterSpeciesArtForward,
  isArtForwardCard,
  luceneDexQuery,
  luceneSpeciesQuery,
} from '../lib/artForward';
import { resolveSpecies, suggestSpecies } from '../lib/pokedex';
import {
  catalogForDex,
  countFormFilters,
  isBaseFormCard,
  normalizeSpeciesToken,
} from '../lib/species';
import { FORM_COVERAGE_PROBES, NEVER_FORM_PILL_LABELS } from '../config/form-coverage-probes';
import {
  SPECIAL_ART_PROMO_SEED,
  isSpecialArtPromoId,
} from '../config/special-art-promos';
import {
  CATALOG_RULES,
  CATALOG_SPECIES_COUNT,
  CATALOG_VERSION,
  assignRealForm,
  formsForSpecies,
} from '../config/real-forms';
import catalogJson from '../data/species-forms-catalog-v1.json';
import { formatMoney, pickTcgplayerPrices, pricesFor } from '../lib/tcgTypes';
import type { TcgCard } from '../lib/tcgTypes';

function card(partial: Partial<TcgCard> & Pick<TcgCard, 'id' | 'name' | 'supertype'>): TcgCard {
  return partial;
}

describe('taxonomy config', () => {
  it('matches schema v1 join key and Pokémon supertype', () => {
    expect(TAXONOMY.version).toBe(1);
    expect(TAXONOMY.species.joinKey).toBe('nationalPokedexNumbers');
    expect(TAXONOMY.species.requireSupertype).toBe('Pokémon');
  });

  it('includes the exact rarity allowlist', () => {
    expect(TAXONOMY.artForward.raritiesInclude).toEqual([
      'Illustration Rare',
      'Special Illustration Rare',
      'Amazing Rare',
      'Radiant Rare',
      'Rare Ultra',
      'Ultra Rare',
      'Rare Rainbow',
      'Rare Secret',
      'Trainer Gallery Rare Holo',
      'Shiny Rare',
      'Shiny Ultra Rare',
      'Rare Shiny',
      'Rare Shiny GX',
      'Mega Hyper Rare',
    ]);
  });

  it('keeps deferred rarities out of the allowlist', () => {
    expect(TAXONOMY.artForward.raritiesInclude).not.toContain('Classic Collection');
    expect(TAXONOMY.artForward.raritiesInclude).not.toContain('MEGA_ATTACK_RARE');
    expect(TAXONOMY.artForward.raritiesInclude).not.toContain('Futuristic Rare');
    expect(TAXONOMY.artForward.raritiesInclude).not.toContain('Black White Rare');
    expect(TAXONOMY.artForward.exclude.raritiesUnlessGallery).toContain('Double Rare');
    expect(TAXONOMY.artForward.exclude.raritiesUnlessGallery).toContain('Promo');
  });

  it('does not treat Radiant as a form facet', () => {
    expect(TAXONOMY.species.nameNormalize.formFacets.map((f) => f.id)).not.toContain('radiant');
  });
});

describe('species resolution', () => {
  it('resolves names to dex rather than relying on a name wildcard bucket', () => {
    expect(resolveSpecies('Meowth')?.n).toBe(52);
    expect(resolveSpecies('Alolan Meowth')?.n).toBe(52);
    expect(resolveSpecies('Galarian Meowth')?.n).toBe(52);
    expect(resolveSpecies('Detective Pikachu')?.n).toBe(25);
    expect(resolveSpecies('charizard')?.n).toBe(6);
  });

  it('strips combat suffixes before matching', () => {
    expect(normalizeSpeciesToken('M Charizard-EX')).toBe('Charizard');
    expect(normalizeSpeciesToken("Team Rocket's Meowth")).toBe('Meowth');
    expect(suggestSpecies('Mega Charizard')[0]?.n).toBe(6);
  });
});

describe('art-forward filter', () => {
  it('includes illustration rarities and Hyper Rare Pokémon', () => {
    expect(
      isArtForwardCard(
        card({
          id: 'a',
          name: 'Charizard',
          supertype: 'Pokémon',
          rarity: 'Illustration Rare',
          nationalPokedexNumbers: [6],
        }),
      ),
    ).toBe(true);
    expect(
      isArtForwardCard(
        card({
          id: 'b',
          name: 'Charizard ex',
          supertype: 'Pokémon',
          rarity: 'Hyper Rare',
          nationalPokedexNumbers: [6],
        }),
      ),
    ).toBe(true);
  });

  it('excludes Energy, play-rarity, Double Rare, and Hyper Rare trainers', () => {
    expect(
      isArtForwardCard(
        card({ id: 'e', name: 'Fire Energy', supertype: 'Energy', rarity: 'Hyper Rare' }),
      ),
    ).toBe(false);
    expect(
      isArtForwardCard(
        card({
          id: 'c',
          name: 'Charizard',
          supertype: 'Pokémon',
          rarity: 'Rare Holo',
          subtypes: ['Tera'],
          nationalPokedexNumbers: [6],
        }),
      ),
    ).toBe(false);
    expect(
      isArtForwardCard(
        card({
          id: 'd',
          name: 'Charizard ex',
          supertype: 'Pokémon',
          rarity: 'Double Rare',
          subtypes: ['ex'],
          nationalPokedexNumbers: [6],
        }),
      ),
    ).toBe(false);
    expect(
      isArtForwardCard(
        card({ id: 't', name: 'Iono', supertype: 'Trainer', rarity: 'Hyper Rare' }),
      ),
    ).toBe(false);
    expect(
      isArtForwardCard(
        card({ id: 'p', name: 'Pikachu', supertype: 'Pokémon', rarity: 'Promo' }),
      ),
    ).toBe(false);
  });

  it('includes specialArtPromo allowlist ids (SWSH260/262) without opening all Promos', () => {
    expect(SPECIAL_ART_PROMO_SEED.ids).toHaveLength(43);
    expect(SPECIAL_ART_PROMO_SEED.meta.count).toBe(43);
    expect(SPECIAL_ART_PROMO_SEED.ids).toEqual(expect.arrayContaining(['swshp-SWSH261']));
    expect(SPECIAL_ART_PROMO_SEED.mustInclude).toEqual(['swshp-SWSH260', 'swshp-SWSH262']);
    expect(SPECIAL_ART_PROMO_SEED.mustInclude.every((id) => isSpecialArtPromoId(id))).toBe(true);

    const swsh260 = card({
      id: 'swshp-SWSH260',
      name: 'Charizard V',
      supertype: 'Pokémon',
      rarity: 'Promo',
      subtypes: ['V'],
      nationalPokedexNumbers: [6],
    });
    const swsh262 = card({
      id: 'swshp-SWSH262',
      name: 'Charizard VSTAR',
      supertype: 'Pokémon',
      rarity: 'Promo',
      subtypes: ['VSTAR'],
      nationalPokedexNumbers: [6],
    });
    const stampPromo = card({
      id: 'swshp-SWSH050',
      name: 'Charizard V',
      supertype: 'Pokémon',
      rarity: 'Promo',
      subtypes: ['V'],
      nationalPokedexNumbers: [6],
    });
    const vstar018 = card({
      id: 'swsh9-018',
      name: 'Charizard VSTAR',
      supertype: 'Pokémon',
      rarity: 'Rare Holo VSTAR',
      subtypes: ['VSTAR'],
      nationalPokedexNumbers: [6],
    });
    const rainbow = card({
      id: 'swsh3-178',
      name: 'Charizard VMAX',
      supertype: 'Pokémon',
      rarity: 'Rare Rainbow',
      subtypes: ['VMAX'],
      nationalPokedexNumbers: [6],
    });

    expect(isArtForwardCard(swsh260)).toBe(true);
    expect(isArtForwardCard(swsh262)).toBe(true);
    expect(isArtForwardCard(stampPromo)).toBe(false);
    expect(isArtForwardCard(vstar018)).toBe(false);
    expect(isArtForwardCard(rainbow)).toBe(true);

    const charizard = filterSpeciesArtForward(MOCK_CARDS, 6).map((c) => c.id);
    expect(charizard).toContain('swshp-SWSH260');
    expect(charizard).toContain('swshp-SWSH261');
    expect(charizard).toContain('swshp-SWSH262');
    expect(charizard).not.toContain('swshp-SWSH050');
    expect(charizard).not.toContain('swsh9-018');
    expect(charizard).toContain('swsh3-178');
  });

  it('includes gallery sets and trainer SIRs per flags, without using subtypes alone', () => {
    expect(
      isArtForwardCard(
        card({
          id: 'g',
          name: 'Galarian Meowth',
          supertype: 'Pokémon',
          rarity: 'Trainer Gallery Rare Holo',
          set: { id: 'swsh9tg', name: 'Brilliant Stars Trainer Gallery' },
          nationalPokedexNumbers: [52],
        }),
      ),
    ).toBe(true);
    expect(
      isArtForwardCard(
        card({
          id: 'sir',
          name: 'Iono',
          supertype: 'Trainer',
          rarity: 'Special Illustration Rare',
        }),
      ),
    ).toBe(true);
    expect(
      isArtForwardCard(
        card({
          id: 'ancient',
          name: 'Walking Wake',
          supertype: 'Pokémon',
          rarity: 'Rare Holo',
          subtypes: ['Ancient'],
          nationalPokedexNumbers: [1009],
        }),
      ),
    ).toBe(false);
  });

  it('does not treat all Rare Holo V as chase, but keeps gallery-set prints', () => {
    expect(
      isArtForwardCard(
        card({
          id: 'v',
          name: 'Pikachu V',
          supertype: 'Pokémon',
          rarity: 'Rare Holo V',
          set: { id: 'swsh4', name: 'Vivid Voltage' },
          nationalPokedexNumbers: [25],
        }),
      ),
    ).toBe(false);
    expect(
      isArtForwardCard(
        card({
          id: 'vtg',
          name: 'Pikachu V',
          supertype: 'Pokémon',
          rarity: 'Rare Holo V',
          set: { id: 'swsh11tg', name: 'Lost Origin Trainer Gallery' },
          nationalPokedexNumbers: [25],
        }),
      ),
    ).toBe(true);
  });

  it('buckets Meowth forms together by dex and keeps form facets on the row', () => {
    const prints = filterSpeciesArtForward(MOCK_CARDS, 52);
    const names = prints.map((c) => c.name).sort();
    expect(names).toEqual(['Alolan Meowth', 'Galarian Meowth', 'Meowth']);
    expect(prints.every((c) => belongsToDex(c, 52))).toBe(true);
    expect(assignRealForm(prints.find((c) => c.name === 'Alolan Meowth')!, 52, 'Meowth')).toBe(
      'alolan',
    );
    expect(assignRealForm(prints.find((c) => c.name === 'Galarian Meowth')!, 52, 'Meowth')).toBe(
      'galarian',
    );
  });

  it('catalog-drives Meowth pills including Gigantamax at 0; Radiant is not a form', () => {
    const prints = [
      card({ id: 'b1', name: 'Meowth', supertype: 'Pokémon' }),
      card({ id: 'b2', name: 'Meowth ex', supertype: 'Pokémon' }),
      card({ id: 'b3', name: "Team Rocket's Meowth", supertype: 'Pokémon' }),
      card({ id: 'r1', name: 'Radiant Meowth', supertype: 'Pokémon' }),
      card({ id: 'a1', name: 'Alolan Meowth', supertype: 'Pokémon' }),
      card({ id: 'g1', name: 'Galarian Meowth', supertype: 'Pokémon' }),
      card({ id: 'g2', name: 'Galarian Meowth', supertype: 'Pokémon' }),
    ];
    expect(prints.filter((c) => isBaseFormCard(c, 52)).map((c) => c.name)).toEqual([
      'Meowth',
      'Meowth ex',
      "Team Rocket's Meowth",
      'Radiant Meowth',
    ]);
    const counts = countFormFilters(prints, 52);
    expect(counts.forms.map((f) => f.id)).toEqual(['base', 'alolan', 'galarian', 'gigantamax']);
    expect(counts.forms.find((f) => f.id === 'base')?.count).toBe(4);
    expect(counts.forms.find((f) => f.id === 'alolan')?.count).toBe(1);
    expect(counts.forms.find((f) => f.id === 'galarian')?.count).toBe(2);
    expect(counts.forms.find((f) => f.id === 'gigantamax')?.count).toBe(0);
    expect(counts.forms.some((f) => f.label === 'Radiant')).toBe(false);
  });

  it('catalogs Charizard Base / Mega X / Mega Y / Gigantamax including zeros', () => {
    const ids = formsForSpecies(6, 'Charizard').map((f) => f.id);
    expect(ids).toEqual(['base', 'mega-x', 'mega-y', 'gigantamax']);
    const prints = [
      card({ id: 'b', name: 'Charizard', supertype: 'Pokémon' }),
      card({ id: 'v', name: 'Charizard V', supertype: 'Pokémon', subtypes: ['V'] }),
      card({
        id: 'x',
        name: 'Mega Charizard X ex',
        supertype: 'Pokémon',
        subtypes: ['MEGA', 'ex'],
        types: ['Fire', 'Dragon'],
      }),
      card({
        id: 'm',
        name: 'M Charizard-EX',
        supertype: 'Pokémon',
        subtypes: ['MEGA'],
        types: ['Fire', 'Dragon'],
      }),
      card({
        id: 'y',
        name: 'Mega Charizard Y ex',
        supertype: 'Pokémon',
        subtypes: ['MEGA', 'ex'],
        types: ['Fire'],
      }),
      card({
        id: 'g',
        name: 'Charizard VMAX',
        supertype: 'Pokémon',
        subtypes: ['VMAX'],
      }),
      card({ id: 'rad', name: 'Radiant Charizard', supertype: 'Pokémon' }),
    ];
    const counts = countFormFilters(prints, 6);
    expect(counts.forms.find((f) => f.id === 'base')?.count).toBe(3);
    expect(counts.forms.find((f) => f.id === 'mega-x')?.label).toBe('Mega Charizard X');
    expect(counts.forms.find((f) => f.id === 'mega-x')?.count).toBe(2);
    expect(counts.forms.find((f) => f.id === 'mega-y')?.label).toBe('Mega Charizard Y');
    expect(counts.forms.find((f) => f.id === 'mega-y')?.count).toBe(1);
    expect(counts.forms.find((f) => f.id === 'gigantamax')?.label).toBe('Gigantamax');
    expect(counts.forms.find((f) => f.id === 'gigantamax')?.count).toBe(1);
  });

  it('catalogs Lucario Base / Mega / Mega Z even when Mega Z is 0', () => {
    expect(formsForSpecies(448, 'Lucario').map((f) => f.label)).toEqual([
      'Base',
      'Mega',
      'Mega Z',
    ]);
    const prints = [
      card({ id: 'b', name: 'Lucario', supertype: 'Pokémon' }),
      card({
        id: 'm',
        name: 'Mega Lucario ex',
        supertype: 'Pokémon',
        subtypes: ['MEGA', 'ex'],
      }),
    ];
    const counts = countFormFilters(prints, 448);
    expect(counts.forms.find((f) => f.id === 'mega')?.count).toBe(1);
    expect(counts.forms.find((f) => f.id === 'mega-z')?.count).toBe(0);
    expect(counts.forms.find((f) => f.label === 'Mega Z')?.count).toBe(0);
  });

  it('still exposes Base for single-form species like Weedle', () => {
    expect(catalogForDex(13).map((f) => f.id)).toEqual(['base']);
    const counts = countFormFilters([], 13);
    expect(counts.all).toBe(0);
    expect(counts.forms.map((f) => ({ id: f.id, label: f.label, count: f.count }))).toEqual([
      { id: 'base', label: 'Base', count: 0 },
    ]);
  });

  it('loads exhaustive catalog v1 (1025 species, no Radiant, zeros stay visible)', () => {
    expect(CATALOG_VERSION).toBe(1);
    expect(CATALOG_SPECIES_COUNT).toBe(1025);
    expect(CATALOG_RULES).toEqual({
      catalogDriven: true,
      radiantIsForm: false,
      zeroCountPillsVisible: true,
    });
    expect(catalogJson.species.map((row) => row.dex)).toEqual(
      Array.from({ length: 1025 }, (_, i) => i + 1),
    );
    expect(catalogJson.species.every((row) => row.forms.some((form) => form.label === 'Base'))).toBe(
      true,
    );
    expect(
      catalogJson.species.some((row) => row.forms.some((form) => form.label === 'Radiant')),
    ).toBe(false);
  });

  it('probe list stays catalog-driven even with an empty result set', () => {
    for (const probe of FORM_COVERAGE_PROBES) {
      const labels = formsForSpecies(probe.dex, probe.name).map((form) => form.label);
      for (const required of probe.requiredLabels) {
        expect(labels).toContain(required);
      }
      if (probe.exactLabels) expect(labels).toEqual([...probe.exactLabels]);
      const empty = countFormFilters([], probe.dex);
      expect(empty.all).toBe(0);
      expect(empty.forms.every((form) => form.count === 0)).toBe(true);
      expect(
        empty.forms.some((form) =>
          (NEVER_FORM_PILL_LABELS as readonly string[]).includes(form.label),
        ),
      ).toBe(false);
    }
  });

  it('does not turn Pikachu costumes into form pills', () => {
    const prints = [
      card({ id: 'b', name: 'Pikachu', supertype: 'Pokémon' }),
      card({ id: 'd', name: 'Detective Pikachu', supertype: 'Pokémon' }),
      card({ id: 'f', name: 'Flying Pikachu', supertype: 'Pokémon' }),
      card({ id: 'g', name: 'Pikachu VMAX', supertype: 'Pokémon', subtypes: ['VMAX'] }),
    ];
    const counts = countFormFilters(prints, 25);
    expect(counts.forms.map((form) => form.label)).toEqual(['Base', 'Gigantamax']);
    expect(counts.forms.find((form) => form.id === 'base')?.count).toBe(3);
    expect(counts.forms.find((form) => form.id === 'gigantamax')?.count).toBe(1);
    expect(assignRealForm({ name: 'Detective Pikachu' }, 25, 'Pikachu')).toBe('base');
  });

  it('keeps Raichu Mega X/Y pills at count 0 until TCG prints exist', () => {
    const counts = countFormFilters(
      [
        card({ id: 'b', name: 'Raichu', supertype: 'Pokémon' }),
        card({ id: 'a', name: 'Alolan Raichu', supertype: 'Pokémon' }),
      ],
      26,
    );
    expect(counts.forms.map((form) => form.label)).toEqual([
      'Base',
      'Alolan',
      'Mega Raichu X',
      'Mega Raichu Y',
    ]);
    expect(counts.forms.find((form) => form.id === 'mega-x')?.count).toBe(0);
    expect(counts.forms.find((form) => form.id === 'mega-y')?.count).toBe(0);
  });

  it('assigns Lucario Mega vs Mega Z without false positives', () => {
    expect(
      assignRealForm({ name: 'Mega Lucario ex', subtypes: ['MEGA', 'ex'] }, 448, 'Lucario'),
    ).toBe('mega');
    expect(assignRealForm({ name: 'M Lucario-EX', subtypes: ['MEGA'] }, 448, 'Lucario')).toBe(
      'mega',
    );
    expect(
      assignRealForm({ name: 'Mega Lucario Z ex', subtypes: ['MEGA', 'ex'] }, 448, 'Lucario'),
    ).toBe('mega-z');
    const counts = countFormFilters(
      [
        card({ id: 'b', name: 'Lucario', supertype: 'Pokémon' }),
        card({
          id: 'm',
          name: 'Mega Lucario ex',
          supertype: 'Pokémon',
          subtypes: ['MEGA', 'ex'],
        }),
        card({ id: 'mx', name: 'M Lucario-EX', supertype: 'Pokémon', subtypes: ['MEGA'] }),
      ],
      448,
    );
    expect(counts.forms.find((form) => form.id === 'mega')?.count).toBe(2);
    expect(counts.forms.find((form) => form.id === 'mega-z')?.label).toBe('Mega Z');
    expect(counts.forms.find((form) => form.id === 'mega-z')?.count).toBe(0);
  });

  it('assigns Deoxys Formes from catalog labels', () => {
    expect(assignRealForm({ name: 'Deoxys' }, 386, 'Deoxys')).toBe('base');
    expect(assignRealForm({ name: 'Deoxys Attack Forme' }, 386, 'Deoxys')).toBe('attack-forme');
    expect(assignRealForm({ name: 'Deoxys Defense Forme' }, 386, 'Deoxys')).toBe('defense-forme');
    expect(assignRealForm({ name: 'Deoxys Speed Forme' }, 386, 'Deoxys')).toBe('speed-forme');
  });

  it('does not treat Detective Pikachu play-rarity as art-forward', () => {
    const pika = MOCK_CARDS.filter((c) => belongsToDex(c, 25));
    expect(pika.some((c) => c.name === 'Detective Pikachu')).toBe(true);
    expect(filterSpeciesArtForward(MOCK_CARDS, 25).map((c) => c.name)).toEqual(['Pikachu']);
  });

  it('builds a dex query instead of a name wildcard', () => {
    const q = luceneSpeciesQuery(52);
    expect(q).toContain('nationalPokedexNumbers:52');
    expect(q).toContain('supertype:Pokémon');
    expect(q).not.toContain('name:meowth');
    expect(luceneDexQuery(52)).toBe('nationalPokedexNumbers:52');
  });
});

describe('prices', () => {
  it('prefers TCGPlayer holofoil market/mid and does not expose Cardmarket/EUR', () => {
    const tcg = pickTcgplayerPrices({
      prices: {
        normal: { mid: 1, market: 1 },
        holofoil: { market: 12.5, mid: 11 },
      },
    });
    expect(tcg).toMatchObject({ market: 12.5, mid: 11 });
    const charizard = MOCK_CARDS.find((c) => c.id === 'sv3pt5-199')!;
    const shown = pricesFor(charizard);
    expect(shown.tcgplayerUsd).toMatchObject({ market: 412.5, mid: 399.99 });
    expect(shown).not.toHaveProperty('cardmarketEur');
    expect(formatMoney(shown.tcgplayerUsd?.market)).toBe('$412.50');
    expect(formatMoney(shown.tcgplayerUsd?.market)).not.toMatch(/€|EUR/i);
  });
});
