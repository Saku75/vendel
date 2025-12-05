import { email, maxLength, nonoptional, string, trim } from "zod/mini";

import { ValidatorCode } from "../main";

const emailValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(320, ValidatorCode.TooLong),
    email(ValidatorCode.InvalidFormat),
  ),
  ValidatorCode.Required,
);

export { emailValidator };
