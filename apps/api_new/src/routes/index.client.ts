import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";

const rootClient = defineRoute((context) => {
  return {
    get: async (): Promise<ClientResult> => {
      return request(context, "/");
    },
  };
});

export { rootClient };
