import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import ts, { ConfigArray } from "typescript-eslint";

function customConfig(): ConfigArray {
  return ts.config(
    js.configs.recommended,
    ...ts.configs.recommended,
    prettier,

    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
      },
      rules: { "no-undef": "off" },
    },
  );
}

export { customConfig, includeIgnoreFile };
