import { getConnInfo } from "hono/cloudflare-workers";
import { createMiddleware } from "hono/factory";

import type { ServerEnv } from "$lib/server";
import { CaptchaService } from "$lib/services/captcha";

const captchaMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  c.set(
    "captcha",
    new CaptchaService(
      c.env.TURNSTILE_SECRET_KEY,
      getConnInfo(c).remote.address,
    ),
  );

  await next();
});

export { captchaMiddleware };
