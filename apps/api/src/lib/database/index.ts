import { drizzle } from "drizzle-orm/d1";
import { getContext } from "hono/context-storage";

import { AppEnv } from "$lib/app";

function database() {
  return drizzle(getContext<AppEnv>().env.DB);
}

export { database };
