import { string } from "zod";

import { ValidatorCode } from "../main";

const idValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .cuid2(ValidatorCode.InvalidFormat);

export { idValidator };
