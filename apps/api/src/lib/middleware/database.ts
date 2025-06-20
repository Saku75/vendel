import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

import { HonoEnv } from "$lib/utils/app";

const databaseMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  c.set(
    "database",
    drizzle(c.env.DB, {
      casing: "snake_case",
    }),
  );

  await next();
});

export { databaseMiddleware };
