import { useEffect, useId, useRef } from 'react';
import {
  ABOUT_FIND_CARDS,
  ABOUT_FOOTER,
  ABOUT_INTRO,
  ABOUT_READING_A_CARD,
  ABOUT_TAGLINE,
  ABOUT_TIPS,
  ABOUT_TITLE,
} from '../content/about';
import { IconClose } from './icons';

type Props = {
  onClose: () => void;
};

export function AboutModal({ onClose }: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="about-head">
          <h2 className="about-title" id={titleId}>
            {ABOUT_TITLE}
          </h2>
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
        <div className="about-body">
          <p>{ABOUT_INTRO}</p>
          <AboutSection heading={ABOUT_FIND_CARDS.heading} items={ABOUT_FIND_CARDS.items} />
          <AboutSection heading={ABOUT_READING_A_CARD.heading} items={ABOUT_READING_A_CARD.items} />
          <AboutSection heading={ABOUT_TIPS.heading} items={ABOUT_TIPS.items} />
          <p className="about-tagline">{ABOUT_TAGLINE}</p>
          <p className="about-footer">{ABOUT_FOOTER}</p>
        </div>
      </div>
    </div>
  );
}

function AboutSection({ heading, items }: { heading: string; items: readonly string[] }) {
  return (
    <section>
      <h3>{heading}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
