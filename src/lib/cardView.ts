/**
 * Card inspect layers for the image-only grid.
 *
 * grid  --open-->  modal  --fullscreen-->  fullscreen
 *              \             |
 *               \            +--back--> modal
 *                +--close--> grid
 *
 * Modal X / backdrop always dismiss to the grid (`close`).
 * Fullscreen back is a chevron that returns to the still-open modal.
 */

export type CardViewLayer = 'closed' | 'modal' | 'fullscreen';

export type CardViewAction = 'open' | 'close' | 'fullscreen' | 'back';

export function reduceCardView(layer: CardViewLayer, action: CardViewAction): CardViewLayer {
  switch (action) {
    case 'open':
      return 'modal';
    case 'close':
      return 'closed';
    case 'fullscreen':
      return layer === 'closed' ? 'closed' : 'fullscreen';
    case 'back':
      return layer === 'fullscreen' ? 'modal' : layer;
    default:
      return layer;
  }
}
