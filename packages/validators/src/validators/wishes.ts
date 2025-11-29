import { number, string } from "zod";

import { ValidatorCode } from "../main";

const wishTitleValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .max(256, ValidatorCode.TooLong);

const wishBrandValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .max(128, ValidatorCode.TooLong)
  .optional();

const wishDescriptionValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .max(512, ValidatorCode.TooLong)
  .optional();

const wishPriceValidator = number({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .min(0, ValidatorCode.TooSmall)
  .optional();

const wishUrlValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .url(ValidatorCode.InvalidFormat)
  .max(2048, ValidatorCode.TooLong)
  .optional();

export {
  wishBrandValidator,
  wishDescriptionValidator,
  wishPriceValidator,
  wishTitleValidator,
  wishUrlValidator,
};
