import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchSpeciesPrints } from '../lib/fetchSpeciesPrints';
import { handleCardsRequest } from './handleCardsRequest';
import { GET, handler } from './vercelCards';

describe('handleCardsRequest', () => {
  it('returns 400 JSON for missing or wildcard dex instead of throwing', async () => {
    await expect(handleCardsRequest('/api/cards', '')).resolves.toMatchObject({
      status: 400,
      body: { error: 'Pass a National Pokédex number as ?dex=52' },
    });
    await expect(handleCardsRequest('/api/cards?dex=*', '')).resolves.toMatchObject({
      status: 400,
    });
  });

  it('returns 500 JSON when the request URL cannot be parsed', async () => {
    const result = await handleCardsRequest('http://[', '');
    expect(result.status).toBe(500);
    expect((result.body as { error?: string }).error).toBeTruthy();
  });
});

describe('Vercel /api/cards handler', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.POKEMONTCG_API_KEY;
  });

  it('GET returns 400 JSON for ?dex=* and never throws', async () => {
    const response = await GET(new Request('https://nomekop-ivory.vercel.app/api/cards?dex=*'));
    expect(response.status).toBe(400);
    expect(response.headers.get('content-type')).toMatch(/application\/json/);
    await expect(response.json()).resolves.toEqual({
      error: 'Pass a National Pokédex number as ?dex=52',
    });
  });

  it('legacy helper returns a Response when res is missing (Web invocation)', async () => {
    const response = await handler(new Request('https://nomekop.local/api/cards?dex=0'));
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(400);
  });

  it('legacy helper writes JSON when Node res helpers exist', async () => {
    const headers: Record<string, string> = {};
    let status = 0;
    let body: unknown;
    const res = {
      status(code: number) {
        status = code;
        return res;
      },
      setHeader(key: string, value: string) {
        headers[key] = value;
      },
      json(payload: unknown) {
        body = payload;
      },
    };

    const result = await handler({ url: '/api/cards?dex=nope' }, res);
    expect(result).toBeUndefined();
    expect(status).toBe(400);
    expect(headers['content-type']).toMatch(/application\/json/);
    expect(body).toEqual({ error: 'Pass a National Pokédex number as ?dex=52' });
  });

  it('ships a self-contained api/cards.js (Vercel Node cannot load ../src/server/*)', () => {
    const bundled = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), '../../api/cards.js'),
      'utf8',
    );
    expect(bundled).not.toMatch(/from ["']\.\.\/src\/server\/handleCardsRequest["']/);
    expect(bundled).toMatch(/export\s*\{/);
  });

  it('falls back to sample prints when live fetch fails and no key is set', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network down');
      }),
    );

    const result = await fetchSpeciesPrints(6, '');
    expect(result.source).toBe('mock');
    expect(result.keyUsed).toBe(false);
    expect(result.warning).toMatch(/POKEMONTCG_API_KEY is unset/);
    expect(result.warning).toMatch(/dev\.pokemontcg\.io/);
    expect(result.prints.length).toBeGreaterThan(0);
  });
});
