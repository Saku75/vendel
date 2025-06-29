import { z } from "zod";

import { ValidatorCode } from "../main";

const idValidator = z
  .string({
    required_error: ValidatorCode.Required,
    invalid_type_error: ValidatorCode.InvalidType,
  })
  .nonempty(ValidatorCode.Required)
  .cuid2(ValidatorCode.InvalidFormat);

export { idValidator };
