import { authClient } from "$routes/auth/client";
import { rootClient } from "$routes/client";
import { userClient } from "$routes/user/client";
import { wishlistsClient } from "$routes/wishlists/client";

import { createBaseClient } from "./client";
import type { ClientConfig } from "./types";

function createClient(config?: ClientConfig) {
  const context = createBaseClient(config);

  return {
    auth: authClient(context),
    user: userClient(context),
    wishlists: wishlistsClient(context),
    root: rootClient(context),
  };
}

type Client = ReturnType<typeof createClient>;

export type { ClientConfig, ClientResult } from "./types";
export { createClient };
export type { Client };
