import { createAuthClient } from "$routes/auth/index.client";

import type { ClientContext } from "./types/context";

const createClient = (context?: Partial<ClientContext>) => {
  const defaultContext: ClientContext = {
    fetch: fetch,
  };
  const mergedContext: ClientContext = { ...defaultContext, ...context };

  mergedContext.fetch.bind(this);

  const customFetch: typeof fetch = (input, init = {}) => {
    const mergedHeaders: HeadersInit = {
      ...context?.headers,
      ...(init.headers || {}),
    };

    return mergedContext.fetch(input, {
      ...init,
      headers: mergedHeaders,
    });
  };

  return {
    auth: createAuthClient(mergedContext, customFetch),
  };
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient();
type Client = typeof client;

export { createClient };
export type { Client };

export { AuthRole } from "$lib/enums/auth/role";

export type {
  SignInFinishRequest,
  SignInSession,
  SignInStartRequest,
  SignInStartResponse,
} from "$routes/auth/sign-in";
export type {
  SignUpFinishRequest,
  SignUpSession,
  SignUpStartRequest,
  SignUpStartResponse,
} from "$routes/auth/sign-up";
export type { WhoAmIResponse } from "$routes/auth/who-am-i";
