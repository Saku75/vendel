import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import type { EmailConfirmRequest } from "./confirm";

const createEmailConfirmClient = createClientRoute(({ context, fetch }) => {
  return async function emailConfirm({ token }: { token: string }) {
    const res = await fetch(getClientUrl(context, "/auth/email/confirm"), {
      method: "post",
      body: JSON.stringify({ token } satisfies EmailConfirmRequest),
    });

    return await handleApiResponse(res);
  };
});

export { createEmailConfirmClient };
