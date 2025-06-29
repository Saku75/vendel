import { z } from "zod";

import { ValidatorCode } from "../main";

const firstNameValidator = z
  .string({
    required_error: ValidatorCode.Required,
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .nonempty(ValidatorCode.Required)
  .max(50, ValidatorCode.TooLong);

const middleNameValidator = z
  .string({
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .max(200, ValidatorCode.TooLong)
  .optional();

const lastNameValidator = z
  .string({
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .max(50, ValidatorCode.TooLong)
  .optional();

export { firstNameValidator, lastNameValidator, middleNameValidator };
