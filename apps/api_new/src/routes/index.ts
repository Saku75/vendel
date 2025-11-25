import { env } from "cloudflare:workers";

import { createServer } from "$lib/server";
import { response } from "$lib/server/response";

import { authServer } from "./auth";

const routes = createServer();

routes.get("/", (c) => {
  return response(c, {
    content: {
      message: `Vendel API - ${env.MODE[0].toUpperCase() + env.MODE.slice(1)}`,
    },
  });
});

routes.route("/auth", authServer);

export { routes };
