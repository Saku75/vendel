import { DrizzleConfig } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { appContext } from "$lib/utils/app";

function database(config?: DrizzleConfig) {
  return drizzle(appContext().env.DB, {
    casing: "snake_case",
    ...config,
  });
}

export { database };
