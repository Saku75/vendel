import { string } from "zod";

import { ValidatorCode } from "../main";

const captchaValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .max(2048, ValidatorCode.TooLong);

export { captchaValidator };
