import type { ClientContext } from "$lib/client/context";

import { createAuthClient } from "$routes/auth/index.client";

const createClient = (ctx?: ClientContext) => ({
  auth: createAuthClient(ctx),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const client = createClient();
type Client = typeof client;

export { createClient };
export type { Client };
