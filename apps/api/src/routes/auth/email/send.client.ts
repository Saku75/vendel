import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import type { EmailSendRequest } from "./send";

const createEmailSendClient = createClientRoute(({ context, fetch }) => {
  return async function emailSend({ captcha }: { captcha: string }) {
    const res = await fetch(getClientUrl(context, "/auth/email/send"), {
      method: "post",
      body: JSON.stringify({ captcha } satisfies EmailSendRequest),
    });

    return await handleApiResponse(res);
  };
});

export { createEmailSendClient };
