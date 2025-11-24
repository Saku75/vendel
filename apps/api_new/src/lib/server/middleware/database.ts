import { drizzle } from "drizzle-orm/d1";
import { createMiddleware } from "hono/factory";

import { ServerEnv } from "$lib/server";

const databaseMiddleware = createMiddleware<ServerEnv>(async (c, next) => {
  c.set(
    "database",
    drizzle(c.env.DB, {
      casing: "snake_case",
    }),
  );

  await next();
});

export { databaseMiddleware };
