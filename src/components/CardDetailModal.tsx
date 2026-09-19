import { useEffect, useId, useRef, useState } from 'react';
import { exampleSoldsEnabled, loadSoldRange } from '../lib/solds';
import { formatMoney, pricesFor, type TcgCard } from '../lib/tcgTypes';
import { venuesFor } from '../lib/venues';
import { IconClose, IconFullscreen } from './icons';
import { SoldDetailSheet } from './SoldDetailSheet';
import { SoldRangeBar } from './SoldRangeBar';

type Props = {
  card: TcgCard;
  formLabel?: string;
  onClose: () => void;
  onFullscreen: () => void;
};

export function CardDetailModal({ card, formLabel, onClose, onFullscreen }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const prices = pricesFor(card);
  const usd = prices.tcgplayerUsd;
  const solds = loadSoldRange(card, 'raw');
  const venues = venuesFor(card);
  const image = card.images?.large ?? card.images?.small;
  const setLabel = [card.set?.name, card.number].filter(Boolean).join(' · ');

  useEffect(() => {
    closeRef.current?.focus();
  }, [card.id]);

  useEffect(() => {
    if (!detailOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      setDetailOpen(false);
    }
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [detailOpen]);

  return (
    <>
      <div className="modal-overlay" role="presentation" onClick={onClose}>
        <div
          className="card-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="modal-art-wrap">
            {image ? (
              <img className="modal-art" src={image} alt="" />
            ) : (
              <div className="modal-art modal-art-missing">card art</div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="icon-btn"
                onClick={onFullscreen}
                aria-label="Fullscreen card image"
                title="Fullscreen"
              >
                <IconFullscreen />
              </button>
              <button
                type="button"
                ref={closeRef}
                className="icon-btn"
                onClick={onClose}
                aria-label="Close"
                title="Close"
              >
                <IconClose />
              </button>
            </div>
          </div>
          <div className="modal-body">
            <h3 className="modal-name" id={titleId}>
              {card.name}
            </h3>
            {setLabel && <p className="modal-meta">{setLabel}</p>}
            {card.rarity && <p className="modal-rarity">{card.rarity}</p>}
            {formLabel && (
              <ul className="facets">
                <li>{formLabel}</li>
              </ul>
            )}
            <div className="price-row">
              <div className="price-block">
                <p className="price-label">Market</p>
                <p className="price-value">{formatMoney(usd?.market)}</p>
              </div>
              <div className="price-block">
                <p className="price-label">Mid</p>
                <p className="price-value">{formatMoney(usd?.mid)}</p>
              </div>
            </div>
            {usd?.url ? (
              <a className="price-source" href={usd.url} target="_blank" rel="noreferrer">
                TCGPlayer USD
              </a>
            ) : (
              <p className="price-source">TCGPlayer USD</p>
            )}
            {(solds || venues.tcgPlayer || venues.ebay) && (
              <SoldRangeBar
                range={solds}
                market={usd?.market}
                tcgPlayerUrl={venues.tcgPlayer}
                ebayUrl={venues.ebay}
                unavailable={!solds && !exampleSoldsEnabled()}
                onOpenDetail={() => setDetailOpen(true)}
              />
            )}
          </div>
        </div>
      </div>
      <SoldDetailSheet card={card} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </>
  );
}
