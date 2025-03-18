import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

import { app } from "$lib/app";

import { v1Routes } from "./v1";

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

routes.route("/v1", v1Routes);

export { routes };
