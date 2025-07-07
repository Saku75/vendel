import { parseString } from "set-cookie-parser";

import { createAuthClient } from "$routes/auth/index.client";

import type { ClientContext } from "./types/context";

const createClient = (context?: Partial<ClientContext>) => {
  const cookieJar: Record<string, string> = {};

  const defaultContext: ClientContext = {
    fetch: globalThis.fetch,
    headers: {},
  };

  const mergedContext: ClientContext = {
    ...defaultContext,
    ...context,
  };

  function getCookieHeader(): string | undefined {
    const entries = Object.entries(cookieJar);
    return entries.length > 0
      ? entries.map(([k, v]) => `${k}=${v}`).join("; ")
      : undefined;
  }

  const customFetch: typeof fetch = async (input, init = {}) => {
    const normalizedContextHeaders: Record<string, string> = {};
    const normalizedInitHeaders: Record<string, string> = {};

    if (context?.headers instanceof Headers) {
      context.headers.forEach((value, key) => {
        normalizedContextHeaders[key] = value;
      });
    } else if (Array.isArray(context?.headers)) {
      for (const [key, value] of context.headers) {
        normalizedContextHeaders[key] = value;
      }
    } else if (context?.headers) {
      Object.assign(normalizedContextHeaders, context.headers);
    }

    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        normalizedInitHeaders[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      for (const [key, value] of init.headers) {
        normalizedInitHeaders[key] = value;
      }
    } else if (init.headers) {
      Object.assign(normalizedInitHeaders, init.headers);
    }

    const cookieHeader = getCookieHeader();

    const finalHeaders: HeadersInit = {
      ...normalizedContextHeaders,
      ...normalizedInitHeaders,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    };

    const finalInit = {
      ...init,
      headers: finalHeaders,
    };

    const res = await mergedContext.fetch(input, finalInit);

    const setCookies = res.headers.getSetCookie?.() ?? [];
    for (const raw of setCookies) {
      const parsed = parseString(raw);
      if (parsed.name && parsed.value) {
        cookieJar[parsed.name] = parsed.value;
      }
    }

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

export { cookieName } from "$lib/utils/cookie/name";
export { createClient };
export type { Client };
