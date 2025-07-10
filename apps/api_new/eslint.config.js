import { defineConfig, globalIgnores } from "eslint/config";

import { customConfig } from "@config/eslint";

export default defineConfig(
  customConfig(),
  globalIgnores(["./src/worker-env.d.ts", "./.wrangler"]),
);
