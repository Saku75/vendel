import { defineRoute, request } from "$lib/client/route";
import type { ClientResult } from "$lib/client/types";

type RootData = {
  message: string;
};

const rootClient = defineRoute((context) => {
  return {
    get: async (): Promise<ClientResult<RootData>> => {
      return request<RootData>(context, "/");
    },
  };
});

export { rootClient };
