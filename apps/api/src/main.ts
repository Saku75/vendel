import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";

import { app } from "$lib/utils/app";

import { routes } from "./routes";

showRoutes(routes);

export default {
  async fetch(request, env, context) {
    const server = app();

    server.use(
      logger(),
      contextStorage(),
      trimTrailingSlash(),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),
    );

    server.route(
      new URL(request.url).origin === env.API_ORIGIN ? "/" : "/api",
      routes,
    );

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<CloudflareBindings>;
