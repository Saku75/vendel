import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";
import type {
  ConfirmEmailRequest,
  ConfirmEmailResponse,
} from "$lib/types/routes/user/email/confirm";

const confirmEmailClient = defineRoute((context) => {
  return async (
    data: ConfirmEmailRequest,
  ): Promise<ClientResult<ConfirmEmailResponse>> => {
    return await request<ConfirmEmailResponse>(context, "user/email/confirm", {
      method: "POST",
      json: data,
    });
  };
});

export { confirmEmailClient };
