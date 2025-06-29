import { z } from "zod";

import { ValidatorCode } from "../main";

const captchaValidator = z
  .string({
    required_error: ValidatorCode.Required,
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .nonempty(ValidatorCode.Required)
  .max(2048, ValidatorCode.TooLong);

export { captchaValidator };
