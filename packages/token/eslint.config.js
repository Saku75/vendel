import { includeIgnoreFile } from "@eslint/compat";
import { fileURLToPath } from "node:url";

import { config } from "@vendel/eslint-config";

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url));

export default config(includeIgnoreFile(gitignorePath));
