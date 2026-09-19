import { fetchSpeciesPrints } from '../lib/fetchSpeciesPrints';

export async function handleCardsRequest(requestUrl: string, apiKey: string) {
  try {
    const url = new URL(requestUrl, 'http://nomekop.local');
    const dex = Number(url.searchParams.get('dex'));

    if (!Number.isInteger(dex) || dex < 1 || dex > 1025) {
      return {
        status: 400,
        body: { error: 'Pass a National Pokédex number as ?dex=52' },
      };
    }

    const result = await fetchSpeciesPrints(dex, apiKey);
    return { status: 200, body: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cards lookup failed';
    return { status: 500, body: { error: message } };
  }
}

export function jsonHeaders(): Record<string, string> {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=60',
  };
}
