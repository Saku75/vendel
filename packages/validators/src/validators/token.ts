import { nonoptional, regex, string, trim } from "zod/mini";

import { ValidatorCode } from "../main";

const tokenValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    regex(
      /^(v\d)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/g,
      ValidatorCode.InvalidFormat,
    ),
  ),
  ValidatorCode.Required,
);

export { tokenValidator };
