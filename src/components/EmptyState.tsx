type Props = {
  speciesName: string;
};

export function EmptyState({ speciesName }: Props) {
  return (
    <div className="empty" role="status">
      <p>
        No full-art / illustration prints were found yet for <strong>{speciesName}</strong>.
      </p>
      <p className="muted">
        Nomekop only lists art-forward rarities and Trainer/Galarian Gallery cards — not
        Common, Uncommon, Rare, Rare Holo, Double Rare, Energy, or bare Promo prints.
      </p>
    </div>
  );
}
