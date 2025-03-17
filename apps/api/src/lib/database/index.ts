import { DrizzleConfig } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { getContext } from "hono/context-storage";

import { AppEnv } from "$lib/app";

function database(config?: DrizzleConfig) {
  return drizzle(getContext<AppEnv>().env.DB, {
    casing: "snake_case",
    ...config,
  });
}

export { database };
