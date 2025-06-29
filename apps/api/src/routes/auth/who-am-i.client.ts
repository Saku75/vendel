import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

import { WhoAmIResponse } from "./who-am-i";

const createWhoAmIClient = createClientRoute((context, fetch) => {
  return async function whoAmI() {
    const res = await fetch(getClientUrl(context, "/auth/whoami"));

    return await handleApiResponse<WhoAmIResponse>(res);
  };
});

export { createWhoAmIClient };
