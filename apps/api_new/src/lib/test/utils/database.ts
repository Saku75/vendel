import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";

const testDatabase = drizzle(env.DB, {
  casing: "snake_case",
});

export { testDatabase };
