import { string } from "zod";

import { ValidatorCode } from "../main";

const passwordValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .min(10, ValidatorCode.TooShort)
  .max(64, ValidatorCode.TooLong)
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/,
    ValidatorCode.InvalidFormat,
  );

const passwordConfirmValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
});

const passwordHashValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .base64url(ValidatorCode.InvalidFormat);

export { passwordConfirmValidator, passwordHashValidator, passwordValidator };
