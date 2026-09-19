import { useMemo, useState } from 'react';
import { formatMoney, type TcgCard } from '../lib/tcgTypes';
import { loadSoldRange, type SoldKind } from '../lib/solds';

type Props = {
  card: TcgCard;
  open: boolean;
  onClose: () => void;
};

export function SoldDetailSheet({ card, open, onClose }: Props) {
  const [kind, setKind] = useState<SoldKind>('raw');
  const range = useMemo(() => loadSoldRange(card, kind), [card, kind]);

  if (!open) return null;

  const lastSolds = [...(range?.sales ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const outliers = lastSolds.filter((sale) => sale.outlier);
  const inliers = lastSolds.filter((sale) => !sale.outlier);

  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sold-sheet-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="sheet-kicker">Recent solds</p>
        <h3 id="sold-sheet-title">{card.name}</h3>
        <p className="muted">
          Outliers and graded comps stay here. The modal bar is raw inliers only.
        </p>
        <div className="sheet-kinds" role="tablist" aria-label="Raw or graded">
          <button type="button" className={kind === 'raw' ? 'is-on' : undefined} onClick={() => setKind('raw')}>
            Raw
          </button>
          <button
            type="button"
            className={kind === 'graded' ? 'is-on' : undefined}
            onClick={() => setKind('graded')}
          >
            Graded
          </button>
        </div>
        {range ? (
          <p className="range-caption">
            {range.windowDays}d · {range.soldCount} sold · L {formatMoney(range.low)} · H{' '}
            {formatMoney(range.high)}
          </p>
        ) : (
          <p className="muted">No {kind} example solds for this print.</p>
        )}
        {inliers.length > 0 && (
          <ul className="sold-list">
            {inliers.map((sale) => (
              <li key={`${sale.date}-${sale.price}`}>
                <span>{sale.date}</span>
                <span>{formatMoney(sale.price)}</span>
              </li>
            ))}
          </ul>
        )}
        {outliers.length > 0 && (
          <>
            <p className="range-title">Outliers (not on tile)</p>
            <ul className="sold-list">
              {outliers.map((sale) => (
                <li key={`out-${sale.date}-${sale.price}`}>
                  <span>{sale.date}</span>
                  <span>{formatMoney(sale.price)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <button type="button" className="sheet-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
