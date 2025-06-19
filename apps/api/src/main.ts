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

  async email(message) {
    const forwardingMails: {
      alias: string;
      forwardTo: string;
    }[] = [
      { alias: "gert@vendel.dk", forwardTo: "gertvendelmann@proton.me" },
      { alias: "jens@vendel.dk", forwardTo: "jensvendellarsen@gmail.com" },
      { alias: "julie@vendel.dk", forwardTo: "julievendel@hotmail.com" },
      { alias: "karina@vendel.dk", forwardTo: "karinavendel@gmail.com" },
      { alias: "lukas@vendel.dk", forwardTo: "lvmann@proton.me" },
      { alias: "susan@vendel.dk", forwardTo: "susanvendel@gmail.com" },
    ];

    const forwardingMail = forwardingMails.find(
      (value) => value.alias === message.to.toLocaleLowerCase(),
    );

    if (!forwardingMail) {
      message.setReject("Email does not exist");
      return;
    }

    await message.forward(forwardingMail.forwardTo);
  },
} satisfies ExportedHandler<CloudflareBindings>;
