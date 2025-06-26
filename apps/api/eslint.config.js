import { defineConfig, globalIgnores } from "eslint/config";

import { customConfig } from "@package/eslint";

export default defineConfig(
  customConfig(),
  globalIgnores(["./src/worker-env.d.ts"]),
);
