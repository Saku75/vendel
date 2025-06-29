import { z } from "zod";

import { ValidatorCode } from "../main";

const emailValidator = z
  .string({
    required_error: ValidatorCode.Required,
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .nonempty(ValidatorCode.Required)
  .max(320, ValidatorCode.TooLong)
  .email(ValidatorCode.InvalidFormat);

export { emailValidator };
