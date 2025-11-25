import { defineRoute, request } from "$lib/client/route";

const rootClient = defineRoute((context) => {
  return async () => request(context, "/");
});

export { rootClient };
