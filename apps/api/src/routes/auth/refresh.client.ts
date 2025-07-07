import { createClientRoute } from "$lib/client/create-route";
import { getClientUrl } from "$lib/client/utils/get-url";
import { handleApiResponse } from "$lib/client/utils/handle-api-response";

const createRefreshClient = createClientRoute(({ context, fetch }) => {
  return async function refresh() {
    const res = await fetch(getClientUrl(context, "/auth/refresh"), {
      method: "post",
    });

    return await handleApiResponse(res);
  };
});

export { createRefreshClient };
