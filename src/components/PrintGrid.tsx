import { assignCardForm, formatFormFilterLabel } from '../lib/species';
import type { TcgCard } from '../lib/tcgTypes';
import { PrintCard } from './PrintCard';

type Props = {
  cards: TcgCard[];
  dex: number;
};

export function PrintGrid({ cards, dex }: Props) {
  return (
    <div className="grid">
      {cards.map((card) => {
        const form = assignCardForm(card, dex);
        return (
          <PrintCard
            key={card.id}
            card={card}
            formLabel={form === 'base' ? undefined : formatFormFilterLabel(form, dex)}
          />
        );
      })}
    </div>
  );
}
