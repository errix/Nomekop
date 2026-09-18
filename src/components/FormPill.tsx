type Props = {
  label: string;
  count: number;
  selected: boolean;
  onSelect: () => void;
};

export function FormPill({ label, count, selected, onSelect }: Props) {
  return (
    <button type="button" className={selected ? 'is-on' : undefined} onClick={onSelect}>
      <span className="facet-label">{label}</span>
      <span className="facet-count">{count}</span>
    </button>
  );
}
