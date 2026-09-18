import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { handleCardsRequest, jsonHeaders } from './handleCardsRequest';

function readUrl(req: IncomingMessage): string {
  return req.url ?? '/';
}

async function writeJson(
  res: ServerResponse,
  status: number,
  body: unknown,
): Promise<void> {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  for (const [key, value] of Object.entries(jsonHeaders())) {
    res.setHeader(key, value);
  }
  res.end(payload);
}

export function cardsApiPlugin(apiKey: string): Plugin {
  const attach = (server: {
    middlewares: {
      use: (
        path: string,
        handler: (req: IncomingMessage, res: ServerResponse, next: () => void) => void,
      ) => void;
    };
  }) => {
    server.middlewares.use('/api/cards', (req, res, next) => {
      if (req.method !== 'GET') {
        next();
        return;
      }
      void handleCardsRequest(readUrl(req), apiKey)
        .then(({ status, body }) => writeJson(res, status, body))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Proxy error';
          void writeJson(res, 500, { error: message });
        });
    });
  };

  return {
    name: 'nomekop-cards-api',
    configureServer(server) {
      attach(server);
    },
    configurePreviewServer(server) {
      attach(server);
    },
  };
}
