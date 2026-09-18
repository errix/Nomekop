/**
 * Live venue deep links for a print.
 *
 * TCGPlayer: product page from pokemontcg.io / pricesFor when present.
 * eBay: sold + completed search (verify only — not the tile bar feed).
 *
 * No marketplace solds API is called here.
 */
import { pricesFor, type TcgCard } from './tcgTypes';

/** eBay Collectible Card Games → Pokémon TCG */
export const EBAY_POKEMON_TCG_CATEGORY = '183454';

export type VenueLinks = {
  tcgPlayer?: string;
  ebay?: string;
};

export function tcgPlayerProductUrl(card: TcgCard): string | undefined {
  const fromPrices = pricesFor(card).tcgplayerUsd?.url?.trim();
  const fromCard = card.tcgplayer?.url?.trim();
  return fromPrices || fromCard || undefined;
}

export function ebaySoldSearchQuery(card: TcgCard): string {
  return [card.name, card.set?.name, card.number]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(' ');
}

export function ebaySoldSearchUrl(card: TcgCard): string | undefined {
  const query = ebaySoldSearchQuery(card);
  if (!query) return undefined;

  const url = new URL('https://www.ebay.com/sch/i.html');
  url.searchParams.set('_nkw', query);
  url.searchParams.set('_sacat', EBAY_POKEMON_TCG_CATEGORY);
  url.searchParams.set('LH_Sold', '1');
  url.searchParams.set('LH_Complete', '1');
  return url.toString();
}

export function venuesFor(card: TcgCard): VenueLinks {
  return {
    tcgPlayer: tcgPlayerProductUrl(card),
    ebay: ebaySoldSearchUrl(card),
  };
}
