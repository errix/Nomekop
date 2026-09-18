import {
  formatCompactUsd,
  isThinSoldCount,
  rangePercent,
  type SoldRange,
} from '../lib/solds';

type Props = {
  range: SoldRange;
  market?: number;
  onOpenDetail: () => void;
};

export function SoldRangeBar({ range, market, onOpenDetail }: Props) {
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
      <p className={thin ? 'range-caption is-thin' : 'range-caption'}>
        {range.windowDays}d · {range.soldCount} sold
      </p>
      {range.example && <p className="range-badge">Example data · not live comps</p>}
      <button type="button" className="range-open" onClick={onOpenDetail}>
        Last solds & filters
      </button>
    </div>
  );
}
