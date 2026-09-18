import { cardFormFacets } from '../lib/species';
import type { TcgCard } from '../lib/tcgTypes';
import { PrintCard } from './PrintCard';

type Props = {
  cards: TcgCard[];
};

export function PrintGrid({ cards }: Props) {
  return (
    <div className="grid">
      {cards.map((card) => (
        <PrintCard key={card.id} card={card} facets={cardFormFacets(card)} />
      ))}
    </div>
  );
}
