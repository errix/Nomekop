import { handleCardsRequest, jsonHeaders } from '../../src/server/handleCardsRequest';

type NetlifyEvent = {
  rawUrl?: string;
  queryStringParameters?: { dex?: string } | null;
};

export async function handler(event: NetlifyEvent) {
  const dex = event.queryStringParameters?.dex ?? '';
  const requestUrl = event.rawUrl ?? `/api/cards?dex=${dex}`;
  const apiKey = process.env.POKEMONTCG_API_KEY ?? '';
  const { status, body } = await handleCardsRequest(requestUrl, apiKey);
  return {
    statusCode: status,
    headers: jsonHeaders(),
    body: JSON.stringify(body),
  };
}
