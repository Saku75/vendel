import { createMiddleware } from "hono/factory";

import { Mail } from "@package/mail";

import { HonoEnv } from "$lib/utils/app";

const mailMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { RESEND_API_KEY, CORS_ORIGINS } = c.env;

  c.set(
    "mail",
    new Mail(
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
