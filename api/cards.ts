import { handleCardsRequest, jsonHeaders } from '../src/server/handleCardsRequest';

type VercelLikeRequest = { url?: string; query?: { dex?: string | string[] } };
type VercelLikeResponse = {
  status: (code: number) => VercelLikeResponse;
  setHeader: (key: string, value: string) => void;
  json: (body: unknown) => void;
};

export default async function handler(req: VercelLikeRequest, res: VercelLikeResponse) {
  const dexParam = req.query?.dex;
  const dex = Array.isArray(dexParam) ? dexParam[0] : dexParam;
  const requestUrl = req.url ?? `/api/cards?dex=${dex ?? ''}`;
  const apiKey = process.env.POKEMONTCG_API_KEY ?? '';
  const { status, body } = await handleCardsRequest(requestUrl, apiKey);
  for (const [key, value] of Object.entries(jsonHeaders())) {
    res.setHeader(key, value);
  }
  res.status(status).json(body);
}
