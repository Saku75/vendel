import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { trimTrailingSlash } from "hono/trailing-slash";

import { databaseMiddleware } from "$lib/middleware/datanase";
import { tokenMiddleware } from "$lib/middleware/token";
import { app } from "$lib/utils/app";

import { routes } from "./routes";

showRoutes(routes);

export default {
  async fetch(request, env, context) {
    const server = app();

    server.use(
      trimTrailingSlash(),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),
      tokenMiddleware,
      databaseMiddleware,
    );

    server.route(
      new URL(request.url).origin === env.API_ORIGIN ? "/" : "/api",
      routes,
    );

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<CloudflareBindings>;
