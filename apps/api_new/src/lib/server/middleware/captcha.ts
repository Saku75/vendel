import { getConnInfo } from "hono/cloudflare-workers";
import { createMiddleware } from "hono/factory";

import { Captcha } from "$lib/captcha";
import { ServerEnv } from "$lib/server";

const captchaMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  c.set(
    "captcha",
    new Captcha(c.env.TURNSTILE_SECRET_KEY, getConnInfo(c).remote.address),
  );

  await next();
});

export { captchaMiddleware };
