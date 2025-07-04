import { createAuthClient } from "$routes/auth/index.client";

import type { ClientContext } from "./types/context";

const createClient = (context?: Partial<ClientContext>) => {
  const defaultContext: ClientContext = {
    fetch: globalThis.fetch,
  };
  const mergedContext: ClientContext = { ...defaultContext, ...context };

  const customFetch: typeof fetch = async (input, init = {}) => {
    const mergedHeaders: HeadersInit = {
      ...(context?.headers || {}),
      ...(init.headers || {}),
    };

    const finalInit = {
      ...init,
      headers: mergedHeaders,
    };

    const res = await mergedContext.fetch(input, finalInit);

    if (mergedContext.hooks?.afterRequest) {
      await mergedContext.hooks.afterRequest(res, input, finalInit);
    }

    return res;
  };

  return {
    auth: createAuthClient({ context: mergedContext, fetch: customFetch }),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient();
type Client = typeof client;

export { createClient };
export type { Client };
