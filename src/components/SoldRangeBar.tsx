import {
  formatCompactUsd,
  isThinSoldCount,
  rangePercent,
  soldRangeCaption,
  type SoldRange,
} from '../lib/solds';

type Props = {
  range: SoldRange;
  market?: number;
  tcgPlayerUrl?: string;
  ebayUrl?: string;
  onOpenDetail: () => void;
};

function VenueButton({
  href,
  label,
  kind,
}: {
  href?: string;
  label: 'TCGPlayer' | 'eBay';
  kind: 'tcg' | 'ebay';
}) {
  const className = `venue-btn venue-${kind}`;
  if (!href) {
    return (
      <span className={`${className} is-disabled`} aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {label}
    </a>
  );
}

export function SoldRangeBar({ range, market, tcgPlayerUrl, ebayUrl, onOpenDetail }: Props) {
  const midPct = rangePercent(range.mid, range.low, range.high);
  const marketPct = market == null ? undefined : rangePercent(market, range.low, range.high);
  const thin = isThinSoldCount(range.soldCount);

  return (
    <div className="range">
      <p className="range-title">Recent solds</p>
      <div className="track-wrap">
        <div className="track">
          <span className="node" style={{ left: '0%' }}>
            <span className="node-label">{formatCompactUsd(range.low)}</span>
          </span>
          <span className="node" style={{ left: `${midPct}%` }}>
            <span className="node-label">{formatCompactUsd(range.mid)}</span>
          </span>
          <span className="node" style={{ left: '100%' }}>
            <span className="node-label">{formatCompactUsd(range.high)}</span>
          </span>
          {marketPct != null && (
            <span className="market-tick" style={{ left: `${marketPct}%` }}>
              <span className="market-label">Market</span>
            </span>
          )}
        </div>
      </div>
      <p className={thin ? 'range-caption is-thin' : 'range-caption'}>{soldRangeCaption(range)}</p>
      {(tcgPlayerUrl || ebayUrl) && (
        <div className="venue-row">
          <VenueButton href={tcgPlayerUrl} label="TCGPlayer" kind="tcg" />
          <VenueButton href={ebayUrl} label="eBay" kind="ebay" />
        </div>
      )}
      {range.example && <p className="range-badge">Example data · not live comps</p>}
      <button type="button" className="range-open" onClick={onOpenDetail}>
        Last solds & filters
      </button>
    </div>
  );
}
