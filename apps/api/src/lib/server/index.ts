import { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

import { MailService } from "@package/mail-service";
import { TokenService } from "@package/token-service";

import { Captcha } from "$lib/captcha";
import { Auth } from "$lib/types/auth";
import { Err } from "$lib/types/result";

type HonoEnv = {
  Bindings: CloudflareBindings;

  Variables: {
    auth: Auth;
    captcha: Captcha;
    database: DrizzleD1Database;
    token: TokenService;
    mail: MailService;
  };
};

function app(config?: HonoOptions<HonoEnv>) {
  const app = new Hono<HonoEnv>(config);

  app.notFound((c) =>
    c.json({ ok: false, status: 404, message: "Not found" } satisfies Err, 404),
  );

  app.onError((err, c) => {
    console.error(err);

    return c.json(
      {
        ok: false,
        status: 500,
        message: "Internal server error",
      } satisfies Err,
      500,
    );
  });

  return app;
}

export { app };
export type { HonoEnv };
