import {
  maxLength,
  minLength,
  nonoptional,
  optional,
  string,
  trim,
} from "zod/mini";

import { ValidatorCode } from "../main";

const wishlistNameValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    minLength(1, ValidatorCode.Required),
    maxLength(128, ValidatorCode.TooLong),
  ),
  ValidatorCode.Required,
);

const wishlistDescriptionValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(256, ValidatorCode.TooLong),
  ),
);

export { wishlistDescriptionValidator, wishlistNameValidator };
