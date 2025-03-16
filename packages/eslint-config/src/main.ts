import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import globals from "globals";
import ts, {
  ConfigArray,
  InfiniteDepthConfigWithExtends,
} from "typescript-eslint";

function config(...configs: InfiniteDepthConfigWithExtends[]): ConfigArray {
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
    },
    ...configs,
  );
}

export { config };
