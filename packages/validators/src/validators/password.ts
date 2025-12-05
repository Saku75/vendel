import {
  base64url,
  maxLength,
  minLength,
  nonoptional,
  regex,
  string,
} from "zod/mini";

import { ValidatorCode } from "../main";

const passwordValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    minLength(10, ValidatorCode.TooShort),
    maxLength(64, ValidatorCode.TooLong),
    regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/,
      ValidatorCode.InvalidFormat,
    ),
  ),
  ValidatorCode.Required,
);

const passwordConfirmValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(minLength(1, ValidatorCode.Required)),
  ValidatorCode.Required,
);

const passwordHashValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    base64url(ValidatorCode.InvalidFormat),
  ),
  ValidatorCode.Required,
);

export { passwordConfirmValidator, passwordHashValidator, passwordValidator };
