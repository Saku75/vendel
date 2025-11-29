import { env } from "cloudflare:workers";

import { createServer } from "$lib/server";
import { response } from "$lib/server/response";

import { authServer } from "./auth";
import { userServer } from "./user";
import { wishlistsServer } from "./wishlists";

const routes = createServer();

routes.get("/", (c) => {
  return response(c, {
    content: {
      message: `Vendel API - ${env.MODE[0].toUpperCase() + env.MODE.slice(1)}`,
    },
  });
});

routes.route("/auth", authServer);
routes.route("/user", userServer);
routes.route("/wishlists", wishlistsServer);

export { routes };
