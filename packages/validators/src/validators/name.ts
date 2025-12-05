import {
  maxLength,
  minLength,
  nonoptional,
  optional,
  string,
  trim,
} from "zod/mini";

import { ValidatorCode } from "../main";

const firstNameValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    minLength(1, ValidatorCode.Required),
    maxLength(64, ValidatorCode.TooLong),
  ),
  ValidatorCode.Required,
);

const middleNameValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(256, ValidatorCode.TooLong),
  ),
);

const lastNameValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(64, ValidatorCode.TooLong),
  ),
);

export { firstNameValidator, lastNameValidator, middleNameValidator };
