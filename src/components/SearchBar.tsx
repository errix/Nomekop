import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { suggestSpecies, type PokedexEntry } from '../lib/pokedex';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (entry: PokedexEntry) => void;
};

export function SearchBar({ value, onChange, onSelect }: Props) {
  const id = useId();
  const listId = `${id}-suggestions`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef<HTMLFormElement>(null);

  const suggestions = useMemo(() => suggestSpecies(value, 8), [value]);

  useEffect(() => {
    setActive(0);
  }, [value]);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function commit(entry: PokedexEntry) {
    onChange(entry.name);
    onSelect(entry);
    setOpen(false);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const hit = suggestions[active] ?? suggestions[0];
    if (hit) commit(hit);
  }

  return (
    <form className="search" ref={wrapRef} onSubmit={onSubmit} role="search">
      <label className="search-label" htmlFor={id}>
        Pokémon
      </label>
      <div className="search-field">
        <input
          id={id}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Charizard, Meowth, Detective Pikachu…"
          value={value}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded={open && suggestions.length > 0}
          role="combobox"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open || !suggestions.length) return;
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setActive((i) => (i + 1) % suggestions.length);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        <button type="submit">Look up</button>
      </div>
      {open && suggestions.length > 0 && (
        <ul id={listId} className="suggestions" role="listbox">
          {suggestions.map((entry, index) => (
            <li key={entry.n} role="option" aria-selected={index === active}>
              <button
                type="button"
                className={index === active ? 'is-active' : undefined}
                onMouseEnter={() => setActive(index)}
                onClick={() => commit(entry)}
              >
                <span className="dex">#{String(entry.n).padStart(4, '0')}</span>
                <span>{entry.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
