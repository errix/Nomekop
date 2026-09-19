import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  ABOUT_FIND_CARDS,
  ABOUT_FOOTER,
  ABOUT_INTRO,
  ABOUT_READING_A_CARD,
  ABOUT_TAGLINE,
  ABOUT_TIPS,
  ABOUT_TITLE,
} from './about';

const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), './about.ts'), 'utf8');

describe('about copy', () => {
  it('keeps the finalized About Nomekop wording', () => {
    expect(ABOUT_TITLE).toBe('About Nomekop');
    expect(ABOUT_INTRO).toBe('Search a Pokémon to see its illustration-style TCG prints.');
    expect(ABOUT_FIND_CARDS).toEqual({
      heading: 'Find cards',
      items: [
        'Type a Pokémon name to search.',
        'Use the filters (All forms / Base / regional forms) to narrow prints. Counts show how many match.',
        'Tap a card image to open details.',
      ],
    });
    expect(ABOUT_READING_A_CARD).toEqual({
      heading: 'Reading a card',
      items: [
        'Market and Mid are TCGPlayer USD snapshots (listing book, not a guarantee).',
        'The solds bar (when shown) is a low / median / high range from recent sales. If it says example data, those comps aren’t live yet.',
        'TCGPlayer opens that print’s product page. eBay opens a sold/completed search for the same print so you can cross-check.',
      ],
    });
    expect(ABOUT_TIPS).toEqual({
      heading: 'Tips',
      items: ['Some species have no illustration prints yet — you’ll see an empty state.'],
    });
    expect(ABOUT_TAGLINE).toBe("A tool to help me catch 'em all (and not drain my wallet).");
    expect(ABOUT_FOOTER).toBe('— Eric Lei');
  });

  it('keeps typographic apostrophes and the em dash from the finalized copy', () => {
    expect(source).toContain('comps aren’t live yet');
    expect(source).toContain('that print’s product page');
    expect(source).toContain('you’ll see an empty state');
    expect(source).toContain("catch 'em all");
    expect(source).toContain('— Eric Lei');
  });
});
