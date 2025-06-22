import { z } from "zod";

import { ValidatorCodes } from "../main";

const captchaValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .nonempty(ValidatorCodes.Required)
  .max(2048, ValidatorCodes.TooLong);

export { captchaValidator };
