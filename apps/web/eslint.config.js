import svelte from "eslint-plugin-svelte";
import { defineConfig } from "eslint/config";
import ts from "typescript-eslint";

import { customConfig } from "@config/eslint";

import svelteConfig from "./svelte.config.ts";

export default defineConfig(
  customConfig(),

  svelte.configs.recommended,
  svelte.configs.prettier,

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
    rules: {
      "svelte/no-navigation-without-resolve": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);
