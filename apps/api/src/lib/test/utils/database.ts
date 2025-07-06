import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";

// Create test database instance with same configuration as production
const testDatabase = drizzle(env.DB, {
  casing: "snake_case",
});

export { testDatabase };
