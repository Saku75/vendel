import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";

/**
 * Singleton database instance
 * Created once per Worker isolate
 */
export const db = drizzle(env.DB, {
  casing: "snake_case",
});
