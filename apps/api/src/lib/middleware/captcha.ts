import { getConnInfo } from "hono/cloudflare-workers";
import { createMiddleware } from "hono/factory";

import { HonoEnv } from "$lib/utils/app";
import { Captcha } from "$lib/utils/captcha";

const captchaMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  c.set(
    "captcha",
    new Captcha(c.env.TURNSTILE_SECRET_KEY, getConnInfo(c).remote.address),
  );

  await next();
});

export { captchaMiddleware };
