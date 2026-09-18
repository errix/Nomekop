import { useEffect, useRef } from 'react';
import type { TcgCard } from '../lib/tcgTypes';
import { IconBack } from './icons';

type Props = {
  card: TcgCard;
  onBack: () => void;
};

export function CardFullscreen({ card, onBack }: Props) {
  const backRef = useRef<HTMLButtonElement>(null);
  const image = card.images?.large ?? card.images?.small;

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
        <div className="fs-card">
          {image ? (
            <img src={image} alt="" />
          ) : (
            <div className="print-missing">card art</div>
          )}
        </div>
      </div>
      <p className="fs-hint">Image only · no prices</p>
    </div>
  );
}
