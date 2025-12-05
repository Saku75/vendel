import { maxLength, minLength, nonoptional, string, trim } from "zod/mini";

import { ValidatorCode } from "../main";

const captchaValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    minLength(1, ValidatorCode.Required),
    maxLength(2048, ValidatorCode.TooLong),
  ),
  ValidatorCode.Required,
);

export { captchaValidator };
