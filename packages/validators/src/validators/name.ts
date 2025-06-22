import { z } from "zod";

import { ValidatorCodes } from "../main";

const firstNameValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .nonempty(ValidatorCodes.Required)
  .max(50, ValidatorCodes.TooLong);

const middleNameValidator = z
  .string({
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .max(200, ValidatorCodes.TooLong)
  .optional();

const lastNameValidator = z
  .string({
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .max(50, ValidatorCodes.TooLong)
  .optional();

export { firstNameValidator, lastNameValidator, middleNameValidator };
