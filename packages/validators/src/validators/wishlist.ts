import { string } from "zod";

import { ValidatorCode } from "../main";

const wishlistNameValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .max(128, ValidatorCode.TooLong);

const wishlistDescriptionValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .max(256, ValidatorCode.TooLong)
  .optional();

export { wishlistDescriptionValidator, wishlistNameValidator };
