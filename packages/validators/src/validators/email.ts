import { string } from "zod";

import { ValidatorCode } from "../main";

const emailValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .max(320, ValidatorCode.TooLong)
  .email(ValidatorCode.InvalidFormat);

export { emailValidator };
