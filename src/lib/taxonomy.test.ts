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
  cardFormFacets,
  countFormFilters,
  isBaseFormCard,
  normalizeSpeciesToken,
} from '../lib/species';
import { pickCardmarketPrices, pickTcgplayerPrices } from '../lib/tcgTypes';
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
    expect(cardFormFacets(prints.find((c) => c.name === 'Alolan Meowth')!)).toContain('alolan');
    expect(cardFormFacets(prints.find((c) => c.name === 'Galarian Meowth')!)).toContain(
      'galarian',
    );
  });

  it('counts Base separately from regional form pills', () => {
    const prints = [
      card({ id: 'b1', name: 'Meowth', supertype: 'Pokémon' }),
      card({ id: 'b2', name: 'Meowth ex', supertype: 'Pokémon' }),
      card({ id: "b3", name: "Team Rocket's Meowth", supertype: 'Pokémon' }),
      card({ id: 'a1', name: 'Alolan Meowth', supertype: 'Pokémon' }),
      card({ id: 'g1', name: 'Galarian Meowth', supertype: 'Pokémon' }),
      card({ id: 'g2', name: 'Galarian Meowth', supertype: 'Pokémon' }),
    ];
    expect(prints.filter(isBaseFormCard).map((c) => c.name)).toEqual([
      'Meowth',
      'Meowth ex',
      "Team Rocket's Meowth",
    ]);
    const counts = countFormFilters(prints);
    expect(counts.base).toBe(3);
    expect(counts.tagged).toEqual([
      { id: 'galarian', count: 2 },
      { id: 'alolan', count: 1 },
    ]);
    expect(counts.base + counts.tagged.reduce((sum, t) => sum + t.count, 0)).toBe(prints.length);
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
  it('prefers TCGPlayer holofoil market/mid and Cardmarket trend/avg', () => {
    const tcg = pickTcgplayerPrices({
      prices: {
        normal: { mid: 1, market: 1 },
        holofoil: { market: 12.5, mid: 11 },
      },
    });
    expect(tcg).toMatchObject({ market: 12.5, mid: 11 });
    const euro = pickCardmarketPrices({
      prices: { trendPrice: 9.1, averageSellPrice: 8.4 },
    });
    expect(euro).toMatchObject({ trend: 9.1, avg: 8.4 });
  });
});
