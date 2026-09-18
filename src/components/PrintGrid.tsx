import { useCallback, useEffect, useState } from 'react';
import { reduceCardView, type CardViewAction, type CardViewLayer } from '../lib/cardView';
import { assignCardForm, formatFormFilterLabel } from '../lib/species';
import type { TcgCard } from '../lib/tcgTypes';
import { CardDetailModal } from './CardDetailModal';
import { CardFullscreen } from './CardFullscreen';
import { PrintCard } from './PrintCard';

type Props = {
  cards: TcgCard[];
  dex: number;
};

export function PrintGrid({ cards, dex }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layer, setLayer] = useState<CardViewLayer>('closed');

  const selected = cards.find((card) => card.id === selectedId);
  const selectedForm = selected ? assignCardForm(selected, dex) : undefined;
  const formLabel =
    selectedForm && selectedForm !== 'base'
      ? formatFormFilterLabel(selectedForm, dex)
      : undefined;

  const dispatch = useCallback((action: CardViewAction, id?: string) => {
    if (action === 'open' && id) {
      setSelectedId(id);
      setLayer((current) => reduceCardView(current, action));
      return;
    }
    if (action === 'close') {
      setSelectedId(null);
      setLayer('closed');
      return;
    }
    setLayer((current) => reduceCardView(current, action));
  }, []);

  useEffect(() => {
    if (selectedId && !cards.some((card) => card.id === selectedId)) {
      setLayer('closed');
      setSelectedId(null);
    }
  }, [cards, selectedId]);

  useEffect(() => {
    if (layer === 'closed') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [layer]);

  useEffect(() => {
    if (layer === 'closed') return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      dispatch(layer === 'fullscreen' ? 'back' : 'close');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [layer, dispatch]);

  return (
    <>
      <div className="grid" aria-hidden={layer !== 'closed'}>
        {cards.map((card) => (
          <PrintCard key={card.id} card={card} onOpen={() => dispatch('open', card.id)} />
        ))}
      </div>
      {selected && layer !== 'closed' && (
        <CardDetailModal
          card={selected}
          formLabel={formLabel}
          onClose={() => dispatch('close')}
          onFullscreen={() => dispatch('fullscreen')}
        />
      )}
      {selected && layer === 'fullscreen' && (
        <CardFullscreen card={selected} onBack={() => dispatch('back')} />
      )}
    </>
  );
}
