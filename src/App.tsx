import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { FormPill } from './components/FormPill';
import { PrintGrid } from './components/PrintGrid';
import { SearchBar } from './components/SearchBar';
import { loadSpeciesPrints } from './lib/client';
import type { SpeciesPrintsResult } from './lib/fetchSpeciesPrints';
import { getSpeciesByDex, resolveSpecies, type PokedexEntry } from './lib/pokedex';
import {
  assignCardForm,
  countFormFilters,
  formatFormFilterLabel,
  type FormFilter,
} from './lib/species';

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
  const [facet, setFacet] = useState<FormFilter>('all');

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

  const facets = useMemo(
    () => (species ? countFormFilters(result?.prints ?? [], species.n) : { all: 0, forms: [] }),
    [result, species],
  );

  const visible = useMemo(() => {
    const prints = result?.prints ?? [];
    if (!species || facet === 'all') return prints;
    return prints.filter((card) => assignCardForm(card, species.n) === facet);
  }, [result, facet, species]);

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
          </div>

          {result?.warning && <p className="banner">{result.warning}</p>}
          {error && <p className="banner error">{error}</p>}

          <div className="facet-bar" role="tablist" aria-label="Form facets">
            <FormPill
              label="All forms"
              count={facets.all}
              selected={facet === 'all'}
              onSelect={() => setFacet('all')}
            />
            {facets.forms.map((form) => (
              <FormPill
                key={form.id}
                label={form.label}
                count={form.count}
                selected={facet === form.id}
                onSelect={() => setFacet(form.id)}
              />
            ))}
          </div>

          {loading && <p className="status">Fetching illustration prints…</p>}

          {!loading && result && visible.length === 0 && (
            <EmptyState
              speciesName={
                facet === 'all'
                  ? species.name
                  : `${species.name} (${formatFormFilterLabel(facet, species.n)})`
              }
            />
          )}

          {!loading && visible.length > 0 && <PrintGrid cards={visible} dex={species.n} />}
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
