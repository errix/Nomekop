import { useState } from 'react';
import { loadSoldRange } from '../lib/solds';
import { formatMoney, pricesFor, type TcgCard } from '../lib/tcgTypes';
import { venuesFor } from '../lib/venues';
import { SoldDetailSheet } from './SoldDetailSheet';
import { SoldRangeBar } from './SoldRangeBar';

type Props = {
  card: TcgCard;
  formLabel?: string;
};

export function PrintCard({ card, formLabel }: Props) {
  const [detailOpen, setDetailOpen] = useState(false);
  const prices = pricesFor(card);
  const usd = prices.tcgplayerUsd;
  const solds = loadSoldRange(card, 'raw');
  const venues = venuesFor(card);
  const image = card.images?.large ?? card.images?.small;
  const setLabel = [card.set?.name, card.number].filter(Boolean).join(' · ');

  return (
    <article className="print">
      <a
        className="print-art"
        href={image}
        target="_blank"
        rel="noreferrer"
        aria-label={`${card.name} high-resolution scan`}
      >
        {image ? (
          <img src={image} alt="" loading="lazy" width={245} height={342} />
        ) : (
          <div className="print-missing">card art</div>
        )}
      </a>
      <div className="print-body">
        <h3>{card.name}</h3>
        <p className="print-meta">{setLabel}</p>
        {card.rarity && <p className="rarity">{card.rarity}</p>}
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
        {solds && (
          <SoldRangeBar
            range={solds}
            market={usd?.market}
            tcgPlayerUrl={venues.tcgPlayer}
            ebayUrl={venues.ebay}
            onOpenDetail={() => setDetailOpen(true)}
          />
        )}
      </div>
      <SoldDetailSheet card={card} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </article>
  );
}
