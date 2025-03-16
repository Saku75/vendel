import { includeIgnoreFile } from "@eslint/compat";
import svelte from "eslint-plugin-svelte";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

import { config } from "@lvmann/eslint-config";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default config(
  includeIgnoreFile(gitignorePath),
  ...svelte.configs["flat/recommended"],
  ...svelte.configs["flat/prettier"],
  {
    files: ["**/*.svelte"],

    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
  },
);
