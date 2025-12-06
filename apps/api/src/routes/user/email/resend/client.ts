import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type { ResendConfirmEmailResponse } from "$lib/types";

const resendConfirmEmailClient = defineRoute((context) => {
  return async (): Promise<ClientResult<ResendConfirmEmailResponse>> => {
    return await request<ResendConfirmEmailResponse>(
      context,
      "user/email/resend",
      {
        method: "POST",
      },
    );
  };
});

export { resendConfirmEmailClient };
