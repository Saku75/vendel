import { z } from "zod";

import { ValidatorCodes } from "../main";

const idValidator = z
  .string({
    required_error: ValidatorCodes.Required,
    invalid_type_error: ValidatorCodes.InvalidType,
  })
  .nonempty(ValidatorCodes.Required)
  .cuid2(ValidatorCodes.InvalidFormat);

export { idValidator };
