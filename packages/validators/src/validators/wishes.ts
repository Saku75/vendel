import {
  maxLength,
  minLength,
  nonoptional,
  nullable,
  number,
  optional,
  string,
  trim,
} from "zod/mini";

import { ValidatorCode } from "../main";

const wishTitleValidator = nonoptional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    minLength(1, ValidatorCode.Required),
    maxLength(256, ValidatorCode.TooLong),
  ),
  ValidatorCode.Required,
);

const wishBrandValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(128, ValidatorCode.TooLong),
  ),
);

const wishDescriptionValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(512, ValidatorCode.TooLong),
  ),
);

const wishPriceValidator = optional(
  nullable(number(ValidatorCode.InvalidType)),
);

const wishUrlValidator = optional(
  string(ValidatorCode.InvalidType).check(
    trim(),
    maxLength(2048, ValidatorCode.TooLong),
  ),
);

export {
  wishBrandValidator,
  wishDescriptionValidator,
  wishPriceValidator,
  wishTitleValidator,
  wishUrlValidator,
};
