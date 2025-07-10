import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";

import { createServer } from "$lib/server";

import { routes } from "./routes";

export default {
  async fetch(request, env, context) {
    const server = createServer();

    server.use(
      // Basic middleware
      logger(),
      trimTrailingSlash(),
      secureHeaders({ strictTransportSecurity: false }),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),

      // Util middleware
    );

    server.route(
      env.API_ORIGINS.split(",").includes(new URL(request.url).origin)
        ? "/"
        : "/api",
      routes,
    );

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<CloudflareBindings>;
