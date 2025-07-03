import { createAuthClient } from "$routes/auth/index.client";

import type { ClientContext } from "./types/context";

const createClient = (context?: Partial<ClientContext>) => {
  const defaultContext: ClientContext = {
    fetch: globalThis.fetch,
  };
  const mergedContext: ClientContext = { ...defaultContext, ...context };

  const customFetch: typeof fetch =
    context?.headers && Object.keys(context.headers).length > 0
      ? (input, init = {}) => {
          const mergedHeaders: HeadersInit = {
            ...context.headers,
            ...(init.headers || {}),
          };

          return mergedContext.fetch(input, {
            ...init,
            headers: mergedHeaders,
          });
        }
      : mergedContext.fetch;

  return {
    auth: createAuthClient({ context: mergedContext, fetch: customFetch }),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient();
type Client = typeof client;

export { createClient };
export type { Client };
