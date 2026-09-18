import pokedex from '../data/pokedex.json';
import { foldName, normalizeSpeciesToken } from './species';

export type PokedexEntry = {
  n: number;
  name: string;
  aliases?: string[];
};

const DEX = pokedex as PokedexEntry[];

export type SpeciesHit = PokedexEntry & { score: number };

function namesOf(entry: PokedexEntry): string[] {
  return [entry.name, ...(entry.aliases ?? [])];
}

export function getSpeciesByDex(dex: number): PokedexEntry | undefined {
  return DEX.find((entry) => entry.n === dex);
}

export function suggestSpecies(query: string, limit = 8): SpeciesHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (/^#?\d{1,4}$/.test(trimmed)) {
    const n = Number(trimmed.replace('#', ''));
    const exact = getSpeciesByDex(n);
    return exact ? [{ ...exact, score: 0 }] : [];
  }

  const foldedQuery = foldName(trimmed);
  const normalizedQuery = foldName(normalizeSpeciesToken(trimmed));
  const ranked: SpeciesHit[] = [];

  for (const entry of DEX) {
    let best = Infinity;
    for (const label of namesOf(entry)) {
      const folded = foldName(label);
      if (folded === foldedQuery || folded === normalizedQuery) {
        best = 0;
        break;
      }
      if (folded.startsWith(foldedQuery) || folded.startsWith(normalizedQuery)) {
        best = Math.min(best, 1 + Math.abs(folded.length - foldedQuery.length));
        continue;
      }
      if (folded.includes(foldedQuery) && foldedQuery.length >= 3) {
        best = Math.min(best, 20 + folded.indexOf(foldedQuery));
      }
    }
    if (best < Infinity) ranked.push({ ...entry, score: best });
  }

  return ranked.sort((a, b) => a.score - b.score || a.n - b.n).slice(0, limit);
}

export function resolveSpecies(query: string): PokedexEntry | undefined {
  return suggestSpecies(query, 1)[0];
}
