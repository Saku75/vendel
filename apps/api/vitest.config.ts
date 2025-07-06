import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const migrationsPath = path.join(
  __dirname,
  "./src/lib/server/database/migrations",
);
const migrations = await readD1Migrations(migrationsPath);

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["./src/lib/test/setup/database.ts"],
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.json" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      },
    },
  },
});
