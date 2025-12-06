import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type { WhoAmIResponse } from "$lib/types";

const whoAmIClient = defineRoute((context) => {
  return async (): Promise<ClientResult<WhoAmIResponse>> => {
    return await request<WhoAmIResponse>(context, "user/who-am-i", {
      method: "GET",
    });
  };
});

export { whoAmIClient };
