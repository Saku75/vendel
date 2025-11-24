import { createMiddleware } from "hono/factory";

import { MailService } from "@package/mail-service";

import { ServerEnv } from "$lib/server";

const mailMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  const { RESEND_API_KEY, CORS_ORIGINS } = c.env;

  c.set(
    "mailService",
    new MailService(
      RESEND_API_KEY,
      {
        baseURL: CORS_ORIGINS.split(",")[0],
      },
      c.env.MODE === "local",
    ),
  );

  await next();
});

export { mailMiddleware };
