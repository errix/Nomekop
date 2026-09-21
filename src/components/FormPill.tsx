import { IconOwnedBall, IconUnownedRing } from './icons';

type Props = {
  label: string;
  count: number;
  selected: boolean;
  owned: boolean;
  onSelect: () => void;
};

export function FormPill({ label, count, selected, owned, onSelect }: Props) {
  return (
    <button
      type="button"
      className={selected ? 'is-on' : undefined}
      onClick={onSelect}
      aria-label={`${label}, ${count} prints, ${owned ? 'owned' : 'not owned'}`}
    >
      <span className="ownership-mark" data-owned={owned ? 'true' : 'false'}>
        {owned ? <IconOwnedBall /> : <IconUnownedRing />}
      </span>
      <span className="facet-label">{label}</span>
      <span className="facet-count">{count}</span>
    </button>
  );
}
