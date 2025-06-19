import { createMiddleware } from "hono/factory";

import { Mail } from "@repo/mail";

import { HonoEnv } from "$lib/utils/app";

const mailMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const { RESEND_API_KEY, CORS_ORIGINS } = c.env;

  c.set(
    "mail",
    new Mail(await RESEND_API_KEY.get(), {
      baseURL: CORS_ORIGINS.split(",")[0],
    }),
  );

  await next();
});

export { mailMiddleware };
