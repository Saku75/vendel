import { z } from "zod";

import { ValidatorCodes } from "../main";

const emailValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .nonempty(ValidatorCodes.Required)
  .max(320, ValidatorCodes.TooLong)
  .email(ValidatorCodes.InvalidFormat);

export { emailValidator };
