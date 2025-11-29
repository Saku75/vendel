import { string } from "zod";

import { ValidatorCode } from "../main";

const firstNameValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .max(64, ValidatorCode.TooLong);

const middleNameValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .max(256, ValidatorCode.TooLong)
  .optional();

const lastNameValidator = string({
  invalid_type_error: ValidatorCode.InvalidType,
})
  .max(64, ValidatorCode.TooLong)
  .optional();

export { firstNameValidator, lastNameValidator, middleNameValidator };
