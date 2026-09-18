export type TcgPriceVariant = {
  low?: number | null;
  mid?: number | null;
  high?: number | null;
  market?: number | null;
  directLow?: number | null;
};

export type TcgPlayerInfo = {
  url?: string;
  updatedAt?: string;
  prices?: Record<string, TcgPriceVariant | undefined>;
};

export type CardmarketPrices = {
  averageSellPrice?: number | null;
  trendPrice?: number | null;
  avg1?: number | null;
  avg7?: number | null;
  avg30?: number | null;
  lowPrice?: number | null;
};

export type CardmarketInfo = {
  url?: string;
  updatedAt?: string;
  prices?: CardmarketPrices;
};

export type TcgCard = {
  id: string;
  name: string;
  supertype: string;
  subtypes?: string[];
  types?: string[];
  number?: string;
  artist?: string;
  rarity?: string;
  nationalPokedexNumbers?: number[];
  set?: {
    id: string;
    name: string;
    series?: string;
    releaseDate?: string;
  };
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: TcgPlayerInfo;
  cardmarket?: CardmarketInfo;
};

export type PrintPrices = {
  tcgplayerUsd?: { market?: number; mid?: number; url?: string; updatedAt?: string };
  cardmarketEur?: { trend?: number; avg?: number; url?: string; updatedAt?: string };
};

const TCGPLAYER_VARIANT_ORDER = [
  'holofoil',
  '1stEditionHolofoil',
  'reverseHolofoil',
  'unlimitedHolofoil',
  'normal',
  '1stEditionNormal',
];

export function pickTcgplayerPrices(info: TcgPlayerInfo | undefined): PrintPrices['tcgplayerUsd'] {
  if (!info?.prices) return undefined;
  const variants = Object.entries(info.prices).filter(([, v]) => v);
  if (!variants.length) return undefined;

  const ranked = [...variants].sort(([a], [b]) => {
    const ia = TCGPLAYER_VARIANT_ORDER.indexOf(a);
    const ib = TCGPLAYER_VARIANT_ORDER.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const chosen = ranked.find(([, v]) => v?.market != null || v?.mid != null)?.[1];
  if (!chosen) return undefined;

  return {
    market: chosen.market ?? undefined,
    mid: chosen.mid ?? undefined,
    url: info.url,
    updatedAt: info.updatedAt,
  };
}

export function pickCardmarketPrices(
  info: CardmarketInfo | undefined,
): PrintPrices['cardmarketEur'] {
  if (!info?.prices) return undefined;
  const trend = info.prices.trendPrice ?? undefined;
  const avg = info.prices.averageSellPrice ?? info.prices.avg7 ?? undefined;
  if (trend == null && avg == null) return undefined;
  return {
    trend: trend ?? undefined,
    avg: avg ?? undefined,
    url: info.url,
    updatedAt: info.updatedAt,
  };
}

export function pricesFor(card: TcgCard): PrintPrices {
  return {
    tcgplayerUsd: pickTcgplayerPrices(card.tcgplayer),
    cardmarketEur: pickCardmarketPrices(card.cardmarket),
  };
}

export function formatMoney(value: number | undefined, currency: 'USD' | 'EUR'): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
