import { useEffect, useRef, type CSSProperties } from 'react';
import type { TcgCard } from '../lib/tcgTypes';
import { IconBack } from './icons';
import { useCardTilt } from './useCardTilt';

type Props = {
  card: TcgCard;
  onBack: () => void;
};

export function CardFullscreen({ card, onBack }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);
  const image = card.images?.large ?? card.images?.small;
  const { dragging, vars, handlers } = useCardTilt();

  useEffect(() => {
    backRef.current?.focus();
  }, [card.id]);

  return (
    <div className="card-fullscreen" role="dialog" aria-modal="true" aria-label="Fullscreen card">
      <div className="fs-bar">
        <button
          type="button"
          ref={backRef}
          className="fs-back"
          onClick={onBack}
          aria-label="Back to details"
        >
          <IconBack />
        </button>
      </div>
      <div className="fs-stage">
        <div
          className={dragging ? 'fs-card is-dragging' : 'fs-card'}
          style={vars as CSSProperties}
          {...handlers}
        >
          {image ? (
            <img src={image} alt="" draggable={false} />
          ) : (
            <div className="print-missing">card art</div>
          )}
          <div className="fs-glare" aria-hidden="true" />
        </div>
      </div>
      <p className="fs-hint">Image only · no prices</p>
    </div>
  );
}
