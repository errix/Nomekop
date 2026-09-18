import { describe, expect, it } from 'vitest';
import { reduceCardView, type CardViewLayer } from './cardView';

const LAYERS: CardViewLayer[] = ['closed', 'modal', 'fullscreen'];

describe('card view layers', () => {
  it('opens a centered modal from the grid', () => {
    expect(reduceCardView('closed', 'open')).toBe('modal');
    expect(reduceCardView('modal', 'open')).toBe('modal');
  });

  it('modal X / backdrop always returns to the grid', () => {
    for (const layer of LAYERS) {
      expect(reduceCardView(layer, 'close')).toBe('closed');
    }
  });

  it('fullscreen opens only from an already-open card', () => {
    expect(reduceCardView('closed', 'fullscreen')).toBe('closed');
    expect(reduceCardView('modal', 'fullscreen')).toBe('fullscreen');
    expect(reduceCardView('fullscreen', 'fullscreen')).toBe('fullscreen');
  });

  it('fullscreen back returns to the modal, not the grid', () => {
    expect(reduceCardView('fullscreen', 'back')).toBe('modal');
    expect(reduceCardView('modal', 'back')).toBe('modal');
    expect(reduceCardView('closed', 'back')).toBe('closed');
  });
});
