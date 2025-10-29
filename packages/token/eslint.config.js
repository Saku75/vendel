import { defineConfig } from "eslint/config";

import { customConfig } from "@config/eslint";

export default defineConfig(customConfig(), {
  languageOptions: {
    parserOptions: {
      tsconfigRootDir: import.meta.dirname,
      project: true,
    },
  },
});
