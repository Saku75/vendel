import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";

import { createServer } from "$lib/server";
import { captchaMiddleware } from "$lib/server/middleware/captcha";

import { routes } from "./routes";

export default {
  async fetch(request, env, context) {
    const server = createServer();

    server.use(
      // Basic middleware
      trimTrailingSlash(),
      secureHeaders({ strictTransportSecurity: false }),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),

      // Util middleware
      captchaMiddleware,
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
