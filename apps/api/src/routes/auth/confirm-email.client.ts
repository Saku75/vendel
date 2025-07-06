import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import { ConfirmEmailRequest } from "./confirm-email";
import { WhoAmIResponse } from "./who-am-i";

const createConfirmEmailClient = createClientRoute(({ context, fetch }) => {
  return async function confirmEmail({
    token,
    captcha,
  }: {
    token: string;
    captcha: string;
  }) {
    const res = await fetch(getClientUrl(context, "/auth/confirm-email"), {
      method: "post",
      body: JSON.stringify({
        token,
        captcha,
      } satisfies ConfirmEmailRequest),
    });

    return await handleApiResponse<WhoAmIResponse>(res);
  };
});

export { createConfirmEmailClient };
