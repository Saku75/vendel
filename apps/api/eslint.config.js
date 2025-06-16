import { defineConfig, globalIgnores } from "eslint/config";

import { customConfig } from "@repo/eslint";

export default defineConfig(
  customConfig(),
  globalIgnores(["./src/worker-env.d.ts"]),
);
