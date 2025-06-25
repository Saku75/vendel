import { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

import { Mail } from "@repo/mail";
import { Token } from "@repo/token";

import { Err } from "$lib/types/result";

import { Captcha } from "./captcha";

type HonoEnv = {
  Bindings: CloudflareBindings;

  Variables: {
    captcha: Captcha;
    database: DrizzleD1Database;
    token: Token;
    mail: Mail;
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
