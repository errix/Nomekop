import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { PrintGrid } from './components/PrintGrid';
import { SearchBar } from './components/SearchBar';
import { loadSpeciesPrints } from './lib/client';
import type { SpeciesPrintsResult } from './lib/fetchSpeciesPrints';
import { getSpeciesByDex, resolveSpecies, type PokedexEntry } from './lib/pokedex';
import { cardFormFacets, formatFacetLabel, type FormFacetId } from './lib/species';

function readInitialQuery(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') ?? '';
}

export default function App() {
  const [query, setQuery] = useState(readInitialQuery);
  const [species, setSpecies] = useState<PokedexEntry | undefined>(() =>
    resolveSpecies(readInitialQuery()),
  );
  const [result, setResult] = useState<SpeciesPrintsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facet, setFacet] = useState<FormFacetId | 'all'>('all');

  const lookup = useCallback(async (entry: PokedexEntry) => {
    setSpecies(entry);
    setFacet('all');
    setLoading(true);
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.set('q', entry.name);
    window.history.replaceState({}, '', url);
    try {
      setResult(await loadSpeciesPrints(entry.n));
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Lookup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = resolveSpecies(readInitialQuery());
    if (initial) void lookup(initial);
  }, [lookup]);

  const facets = useMemo(() => {
    const counts = new Map<FormFacetId, number>();
    for (const card of result?.prints ?? []) {
      for (const id of cardFormFacets(card)) {
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [result]);

  const visible = useMemo(() => {
    const prints = result?.prints ?? [];
    if (facet === 'all') return prints;
    return prints.filter((card) => cardFormFacets(card).includes(facet));
  }, [result, facet]);

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">Nomekop · slice 1</p>
        <h1>Art-forward TCG prints</h1>
        <p className="lede">
          Type a Pokémon. We resolve it to a National Dex number so every form — Alolan,
          Galarian, costume, TAG TEAM — lands in the same bucket, then keep illustration-style
          rarities with TCGPlayer and Cardmarket snapshots.
        </p>
        <SearchBar value={query} onChange={setQuery} onSelect={(entry) => void lookup(entry)} />
      </header>

      {species && (
        <section className="results" aria-live="polite">
          <div className="results-head">
            <h2>
              {species.name}{' '}
              <span className="dex-pill">#{String(species.n).padStart(4, '0')}</span>
            </h2>
            {result && (
              <p className="count">
                {visible.length} print{visible.length === 1 ? '' : 's'}
                {facet !== 'all' ? ` · ${formatFacetLabel(facet)}` : ''}
                {result.source === 'live' ? ' · live pokemontcg.io' : ' · sample data'}
              </p>
            )}
          </div>

          {result?.warning && <p className="banner">{result.warning}</p>}
          {error && <p className="banner error">{error}</p>}

          {facets.length > 0 && (
            <div className="facet-bar" role="tablist" aria-label="Form facets">
              <button
                type="button"
                className={facet === 'all' ? 'is-on' : undefined}
                onClick={() => setFacet('all')}
              >
                All forms
              </button>
              {facets.map(([id, count]) => (
                <button
                  key={id}
                  type="button"
                  className={facet === id ? 'is-on' : undefined}
                  onClick={() => setFacet(id)}
                >
                  {formatFacetLabel(id)} {count}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="status">Fetching illustration prints…</p>}

          {!loading && result && visible.length === 0 && (
            <EmptyState
              speciesName={
                facet === 'all'
                  ? species.name
                  : `${species.name} (${formatFacetLabel(facet)})`
              }
            />
          )}

          {!loading && visible.length > 0 && <PrintGrid cards={visible} />}
        </section>
      )}

      {!species && !loading && (
        <p className="hint">
          Try Charizard, Pikachu, or Meowth. Regional names still join on dex —
          Galarian Meowth is #{getSpeciesByDex(52)?.n}.
        </p>
      )}
    </div>
  );
}
