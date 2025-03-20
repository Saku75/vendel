import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

import { app } from "$lib/app";

import { categoriesRoutes } from "./categories";
import { usersRoutes } from "./users";
import { wishlistsRoutes } from "./wishlists";

const routes = app();

routes.use(
  cors({
    origin: (origin) =>
      /((dev\.)?vendel\.dk|localhost(:\d{1,5}?))$/.test(origin)
        ? origin
        : undefined,
  }),
  trimTrailingSlash(),
  contextStorage(),
);

routes.route("/categories", categoriesRoutes);
routes.route("/users", usersRoutes);
routes.route("/wishlists", wishlistsRoutes);

export { routes };
