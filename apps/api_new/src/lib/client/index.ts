import { rootClient } from "$routes/index.client";

import { createBaseClient } from "./client";
import type { ClientConfig } from "./types";

function createClient(config?: ClientConfig) {
  const context = createBaseClient(config);

  return {
    root: rootClient(context),
  };
}

type Client = ReturnType<typeof createClient>;

export type { ClientConfig, ClientResult } from "./types";
export { createClient };
export type { Client };
