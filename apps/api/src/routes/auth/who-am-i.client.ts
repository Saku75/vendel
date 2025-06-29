import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/get-url";
import { handleApiResponse } from "$lib/client/handle-response";

import { WhoAmIResponse } from "./who-am-i";

const createWhoAmIClient = createClientRoute((ky, ctx) => {
  return async function whoAmI() {
    const res = await ky.get(getClientUrl("/auth/whoami", ctx));

    return await handleApiResponse<WhoAmIResponse>(res);
  };
});

export { createWhoAmIClient };
