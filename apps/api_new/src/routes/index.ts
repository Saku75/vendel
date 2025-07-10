import { env } from "cloudflare:workers";

import { createServer } from "$lib/server";
import { response } from "$lib/server/response";

const routes = createServer();

routes.get("/", (c) => {
  return response(c, {
    content: {
      message: `Vendel API - ${env.MODE[0].toUpperCase() + env.MODE.slice(1)}`,
    },
  });
});

export { routes };
