import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/server/database/schema/*",
  out: "./src/lib/server/database/migrations",
  dialect: "sqlite",
  casing: "snake_case",
});
