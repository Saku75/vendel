import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";

const signOutClient = defineRoute((context) => {
  return async (): Promise<ClientResult<undefined>> => {
    return await request<undefined>(context, "/auth/sign-out", {
      method: "POST",
    });
  };
});

export { signOutClient };
