import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { Config, defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

function customConfig(): Config[] {
  return defineConfig(
    globalIgnores([
      "./dist",
      "./node_modules",
      "./.svelte-kit",
      "./src/worker-env.d.ts",
    ]),

    js.configs.recommended,
    ts.configs.recommended,
    prettier,

    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
        parserOptions: {
          tsconfigRootDir: process.cwd(),
        },
      },
      rules: { "no-undef": "off" },
    },
  );
}

export { customConfig, includeIgnoreFile };
