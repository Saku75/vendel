import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

const createSignOutClient = createClientRoute(({ context, fetch }) => {
  return async function signOut() {
    const res = await fetch(getClientUrl(context, "/auth/sign-out"));

    return await handleApiResponse(res);
  };
});

export { createSignOutClient };
