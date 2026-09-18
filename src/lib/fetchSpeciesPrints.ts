import { MOCK_CARDS } from '../data/mockCards';
import { filterSpeciesArtForward, luceneSpeciesQuery } from './artForward';
import { getSpeciesByDex } from './pokedex';
import type { TcgCard } from './tcgTypes';

const API_BASE = 'https://api.pokemontcg.io/v2';
const PAGE_SIZE = 250;
const SELECT = [
  'id',
  'name',
  'supertype',
  'subtypes',
  'number',
  'artist',
  'rarity',
  'nationalPokedexNumbers',
  'set',
  'images',
  'tcgplayer',
  'cardmarket',
].join(',');

export type CardsSource = 'live' | 'mock';

export type SpeciesPrintsResult = {
  source: CardsSource;
  dex: number;
  speciesName: string;
  query: string;
  keyUsed: boolean;
  totalFromApi: number;
  prints: TcgCard[];
  warning?: string;
};

type ApiPage = {
  data?: TcgCard[];
  totalCount?: number;
  page?: number;
  pageSize?: number;
};

async function fetchPage(
  query: string,
  page: number,
  apiKey: string,
): Promise<ApiPage> {
  const url = new URL(`${API_BASE}/cards`);
  url.searchParams.set('q', query);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(PAGE_SIZE));
  url.searchParams.set('orderBy', 'set.releaseDate,number');
  url.searchParams.set('select', SELECT);

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (apiKey) headers['X-Api-Key'] = apiKey;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`pokemontcg.io ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as ApiPage;
}

function mockResult(dex: number, reason: string): SpeciesPrintsResult {
  const species = getSpeciesByDex(dex);
  const prints = filterSpeciesArtForward(MOCK_CARDS, dex);
  return {
    source: 'mock',
    dex,
    speciesName: species?.name ?? `Dex ${dex}`,
    query: luceneSpeciesQuery(dex),
    keyUsed: false,
    totalFromApi: prints.length,
    prints,
    warning: `${reason} Showing sample prints so you can still verify the filter and UI.`,
  };
}

function sortPrints(cards: TcgCard[]): TcgCard[] {
  return [...cards].sort((a, b) => {
    const da = a.set?.releaseDate ?? '';
    const db = b.set?.releaseDate ?? '';
    if (da !== db) return db.localeCompare(da);
    return (a.number ?? '').localeCompare(b.number ?? '', undefined, { numeric: true });
  });
}

export async function fetchSpeciesPrints(
  dex: number,
  apiKey = '',
): Promise<SpeciesPrintsResult> {
  const species = getSpeciesByDex(dex);
  const speciesName = species?.name ?? `Dex ${dex}`;
  const query = luceneSpeciesQuery(dex);

  try {
    const first = await fetchPage(query, 1, apiKey);
    const all: TcgCard[] = [...(first.data ?? [])];
    const total = first.totalCount ?? all.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    for (let page = 2; page <= pages; page += 1) {
      const next = await fetchPage(query, page, apiKey);
      all.push(...(next.data ?? []));
    }

    const prints = sortPrints(filterSpeciesArtForward(all, dex));
    return {
      source: 'live',
      dex,
      speciesName,
      query,
      keyUsed: Boolean(apiKey),
      totalFromApi: total,
      prints,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    return mockResult(dex, `Live pokemontcg.io lookup failed (${message}).`);
  }
}
