import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";

const refreshClient = defineRoute((context) => {
  return async (): Promise<ClientResult<undefined>> => {
    return await request<undefined>(context, "auth/refresh", {
      method: "POST",
    });
  };
});

export { refreshClient };
