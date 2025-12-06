import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type { RefreshResponse } from "$lib/types";

const refreshClient = defineRoute((context) => {
  return async (): Promise<ClientResult<RefreshResponse>> => {
    return await request<RefreshResponse>(context, "auth/refresh", {
      method: "POST",
    });
  };
});

export { refreshClient };
