import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import type { Config } from "eslint/config";
import eslintConfig from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

const { defineConfig, globalIgnores } = eslintConfig;

function customConfig(): Config[] {
  return defineConfig(
    globalIgnores([
      "./dist",
      "./node_modules",
      "./.svelte-kit",
      "./.wrangler",
      "./src/worker-env.d.ts",
    ]),

    js.configs.recommended,
    ts.configs.recommendedTypeChecked,
    prettier,

    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir: process.cwd(),
        },
      },
      rules: {
        "no-undef": "off",
        "@typescript-eslint/consistent-type-imports": [
          "error",
          {
            prefer: "type-imports",
            fixStyle: "separate-type-imports",
          },
        ],
      },
    },
    {
      files: ["**/*.d.ts"],
      rules: {
        "@typescript-eslint/consistent-type-imports": "off",
      },
    },
  );
}

export { customConfig, includeIgnoreFile };
