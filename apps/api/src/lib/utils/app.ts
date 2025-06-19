import { DrizzleD1Database } from "drizzle-orm/d1";
import { Hono } from "hono";
import { HonoOptions } from "hono/hono-base";

import { Token } from "@repo/token";

type HonoEnv = {
  Bindings: CloudflareBindings;

  Variables: {
    database: DrizzleD1Database;
    token: Token;
  };
};

function app(config?: HonoOptions<HonoEnv>) {
  const app = new Hono<HonoEnv>(config);

  app.notFound((c) => c.json({ status: 404, message: "Not found" }, 404));

  return app;
}

export { app };
export type { HonoEnv };
