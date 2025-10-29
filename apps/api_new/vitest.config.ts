import {
  defineWorkersConfig,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers/config";
import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";

const migrationsPath = path.join(__dirname, "./src/lib/database/migrations");
const migrations = await readD1Migrations(migrationsPath);

export default defineWorkersConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: "./src/test/setups/index.ts",
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
