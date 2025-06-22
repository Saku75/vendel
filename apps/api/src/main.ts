import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { trimTrailingSlash } from "hono/trailing-slash";

import { captchaMiddleware } from "$lib/middleware/captcha";
import { databaseMiddleware } from "$lib/middleware/database";
import { mailMiddleware } from "$lib/middleware/mail";
import { tokenMiddleware } from "$lib/middleware/token";
import { app } from "$lib/utils/app";

import { routes } from "./routes";

export default {
  async fetch(request, env, context) {
    const server = app();

    server.use(
      trimTrailingSlash(),
      secureHeaders({ strictTransportSecurity: false, xXssProtection: "1" }),
      cors({
        origin: env.CORS_ORIGINS.split(","),
      }),
      captchaMiddleware,
      databaseMiddleware,
      mailMiddleware,
      tokenMiddleware,
    );

    server.route(
      new URL(request.url).origin === env.API_ORIGIN ? "/" : "/api",
      routes,
    );

    return await server.fetch(request, env, context);
  },
} satisfies ExportedHandler<CloudflareBindings>;
