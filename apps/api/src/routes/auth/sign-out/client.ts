import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type { SignOutResponse } from "$lib/types";

const signOutClient = defineRoute((context) => {
  return async (): Promise<ClientResult<SignOutResponse>> => {
    return await request<SignOutResponse>(context, "auth/sign-out", {
      method: "POST",
    });
  };
});

export { signOutClient };
