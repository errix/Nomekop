import type { ReactNode } from 'react';
import { formatMoney, pricesFor, type TcgCard } from '../lib/tcgTypes';

type Props = {
  card: TcgCard;
  formLabel?: string;
};

export function PrintCard({ card, formLabel }: Props) {
  const prices = pricesFor(card);
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
          <div className="print-missing">No scan</div>
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
        <dl className="prices">
          <div>
            <dt>TCGPlayer USD</dt>
            <dd>
              {prices.tcgplayerUsd ? (
                <PriceLink href={prices.tcgplayerUsd.url}>
                  {formatMoney(prices.tcgplayerUsd.market, 'USD')}
                  <span className="muted"> market</span>
                  {prices.tcgplayerUsd.mid != null && (
                    <>
                      <br />
                      {formatMoney(prices.tcgplayerUsd.mid, 'USD')}
                      <span className="muted"> mid</span>
                    </>
                  )}
                </PriceLink>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt>Cardmarket EUR</dt>
            <dd>
              {prices.cardmarketEur ? (
                <PriceLink href={prices.cardmarketEur.url}>
                  {formatMoney(prices.cardmarketEur.trend, 'EUR')}
                  <span className="muted"> trend</span>
                  {prices.cardmarketEur.avg != null && (
                    <>
                      <br />
                      {formatMoney(prices.cardmarketEur.avg, 'EUR')}
                      <span className="muted"> avg</span>
                    </>
                  )}
                </PriceLink>
              ) : (
                '—'
              )}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

function PriceLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <span>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
