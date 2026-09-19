import type { TcgCard } from '../lib/tcgTypes';

type Props = {
  card: TcgCard;
  onOpen: () => void;
};

export function PrintCard({ card, onOpen }: Props) {
  const image = card.images?.small ?? card.images?.large;

  return (
    <button
      type="button"
      className="print"
      onClick={onOpen}
      aria-label={`Open details for ${card.name}`}
    >
      {image ? (
        <img src={image} alt="" loading="lazy" width={245} height={342} />
      ) : (
        <span className="print-missing">card art</span>
      )}
    </button>
  );
}
