/** Finalized About copy. Keep these strings verbatim. */
export const ABOUT_TITLE = 'About Nomekop';

export const ABOUT_INTRO = 'Search a Pokémon to see its illustration-style TCG prints.';

export const ABOUT_FIND_CARDS = {
  heading: 'Find cards',
  items: [
    'Type a Pokémon name to search.',
    'Use the filters (All forms / Base / regional forms) to narrow prints. Counts show how many match.',
    'Tap a card image to open details.',
  ],
} as const;

export const ABOUT_READING_A_CARD = {
  heading: 'Reading a card',
  items: [
    'Market and Mid are TCGPlayer USD snapshots (listing book, not a guarantee).',
    'The solds bar (when shown) is a low / median / high range from recent sales. If it says example data, those comps aren’t live yet.',
    'TCGPlayer opens that print’s product page. eBay opens a sold/completed search for the same print so you can cross-check.',
  ],
} as const;

export const ABOUT_TIPS = {
  heading: 'Tips',
  items: ['Some species have no illustration prints yet — you’ll see an empty state.'],
} as const;

export const ABOUT_TAGLINE = "A tool to help me catch 'em all (and not drain my wallet).";

export const ABOUT_FOOTER = '— Eric Lei';
