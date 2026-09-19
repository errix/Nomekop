import { handleCardsRequest, jsonHeaders } from './handleCardsRequest';

type NodeLikeResponse = {
  status: (code: number) => NodeLikeResponse;
  setHeader: (key: string, value: string) => void;
  json: (body: unknown) => void;
};

function readApiKey(): string {
  return process.env.POKEMONTCG_API_KEY ?? '';
}

type NodeLikeRequest = { url?: string; query?: { dex?: string | string[] } };

function requestUrlFrom(input: Request | NodeLikeRequest): string {
  if (typeof Request !== 'undefined' && input instanceof Request) {
    return input.url;
  }
  const nodeReq = input as NodeLikeRequest;
  const dexParam = nodeReq.query?.dex;
  const dex = Array.isArray(dexParam) ? dexParam[0] : dexParam;
  return nodeReq.url ?? `/api/cards?dex=${dex ?? ''}`;
}

async function cardsPayload(requestUrl: string): Promise<{ status: number; body: unknown }> {
  try {
    return await handleCardsRequest(requestUrl, readApiKey());
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Cards lookup failed';
    return { status: 500, body: { error: message } };
  }
}

function asJsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders() });
}

function isNodeResponse(value: unknown): value is NodeLikeResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NodeLikeResponse).status === 'function' &&
    typeof (value as NodeLikeResponse).setHeader === 'function' &&
    typeof (value as NodeLikeResponse).json === 'function'
  );
}

/** Current Vercel /api contract for Vite: named method export. */
export async function GET(request: Request): Promise<Response> {
  const { status, body } = await cardsPayload(request.url);
  return asJsonResponse(status, body);
}

/**
 * Legacy Node helper `(req, res)` — returns a Web Response when `res` is
 * missing (current Vercel Web invocation) instead of throwing.
 */
export async function handler(
  req: Request | NodeLikeRequest,
  res?: NodeLikeResponse,
): Promise<Response | void> {
  const { status, body } = await cardsPayload(requestUrlFrom(req));
  if (isNodeResponse(res)) {
    try {
      for (const [key, value] of Object.entries(jsonHeaders())) {
        res.setHeader(key, value);
      }
      res.status(status).json(body);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Cards lookup failed';
      return asJsonResponse(500, { error: message });
    }
  }
  return asJsonResponse(status, body);
}

/** Dual export: Web `fetch` plus callable Node helper. */
const vercelCardsApi = Object.assign(handler, { fetch: GET });
export default vercelCardsApi;
