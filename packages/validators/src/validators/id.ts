import { cuid2, nonoptional, string, trim } from "zod/mini";

import { ValidatorCode } from "../main";

const idValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    cuid2(ValidatorCode.InvalidFormat),
  ),
  ValidatorCode.Required,
);

export { idValidator };
