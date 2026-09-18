import { describe, expect, it } from 'vitest';
import { MOCK_CARDS } from '../data/mockCards';
import {
  EBAY_POKEMON_TCG_CATEGORY,
  ebaySoldSearchQuery,
  ebaySoldSearchUrl,
  tcgPlayerProductUrl,
  venuesFor,
} from './venues';

describe('venue deep links', () => {
  it('uses the existing TCGPlayer product URL for Charizard SIR', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    expect(tcgPlayerProductUrl(card)).toBe('https://prices.pokemontcg.io/tcgplayer/sv3pt5-199');
    expect(venuesFor(card).tcgPlayer).toBe(card.tcgplayer?.url);
  });

  it('builds an eBay sold/completed search from name + set + number', () => {
    const card = MOCK_CARDS.find((item) => item.id === 'sv3pt5-199')!;
    expect(ebaySoldSearchQuery(card)).toBe('Charizard ex 151 199');

    const url = new URL(ebaySoldSearchUrl(card)!);
    expect(url.origin + url.pathname).toBe('https://www.ebay.com/sch/i.html');
    expect(url.searchParams.get('_nkw')).toBe('Charizard ex 151 199');
    expect(url.searchParams.get('_sacat')).toBe(EBAY_POKEMON_TCG_CATEGORY);
    expect(url.searchParams.get('LH_Sold')).toBe('1');
    expect(url.searchParams.get('LH_Complete')).toBe('1');
  });

  it('still builds eBay when TCGPlayer product URL is missing', () => {
    const meowth = MOCK_CARDS.find((item) => item.id === 'sv8-227')!;
    expect(tcgPlayerProductUrl(meowth)).toBeUndefined();
    expect(venuesFor(meowth).tcgPlayer).toBeUndefined();
    expect(ebaySoldSearchQuery(meowth)).toBe('Meowth Surging Sparks 227');
    expect(venuesFor(meowth).ebay).toContain('LH_Sold=1');
    expect(venuesFor(meowth).ebay).toContain('LH_Complete=1');
    expect(venuesFor(meowth).ebay).toContain(`_sacat=${EBAY_POKEMON_TCG_CATEGORY}`);
  });

  it('omits eBay only when name/set/number cannot form a query', () => {
    expect(ebaySoldSearchUrl({ id: 'x', name: '', supertype: 'Pokémon' })).toBeUndefined();
  });
});
