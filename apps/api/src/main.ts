import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";

import { app } from "$lib/server";
import { authMiddleware } from "$lib/server/middleware/auth";
import { captchaMiddleware } from "$lib/server/middleware/captcha";
import { databaseMiddleware } from "$lib/server/middleware/database";
import { mailMiddleware } from "$lib/server/middleware/mail";
import { tokenMiddleware } from "$lib/server/middleware/token";

import { routes } from "./routes";

export default {
  async fetch(request, env, context) {
    const server = app();

    server.use(
      logger(),
      trimTrailingSlash(),
      secureHeaders({ strictTransportSecurity: false, xXssProtection: "1" }),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),

      captchaMiddleware,
      databaseMiddleware,
      mailMiddleware,
      tokenMiddleware,

      authMiddleware,
    );

    server.route(
      new URL(request.url).origin === env.API_ORIGIN ? "/" : "/api",
      routes,
    );

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<CloudflareBindings>;
