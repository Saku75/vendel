import svelte from "eslint-plugin-svelte";
import { defineConfig, globalIgnores } from "eslint/config";
import ts from "typescript-eslint";

import { customConfig } from "@config/eslint";

import svelteConfig from "./svelte.config.js";

export default defineConfig(
  customConfig(),
  ...svelte.configs.recommended,
  ...svelte.configs.prettier,
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  globalIgnores(["./src/worker-env.d.ts", "./.svelte-kit"]),
);
