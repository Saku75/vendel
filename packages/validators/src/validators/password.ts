import z from "zod";

import { ValidatorCodes } from "../main";

const passwordValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .min(10, ValidatorCodes.TooShort)
  .max(64, ValidatorCodes.TooLong)
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/,
    ValidatorCodes.InvalidFormat,
  );

const passwordConfirmValidator = z.string({
  required_error: ValidatorCodes.Required,
  invalid_type_error: ValidatorCodes.InvalidType,
});

const passwordHashValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .nonempty(ValidatorCodes.Required)
  .base64url(ValidatorCodes.InvalidFormat);

export { passwordConfirmValidator, passwordHashValidator, passwordValidator };
