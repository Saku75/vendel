import { string } from "zod";

import { ValidatorCode } from "../main";

const tokenValidator = string({
  required_error: ValidatorCode.Required,
  invalid_type_error: ValidatorCode.InvalidType,
})
  .nonempty(ValidatorCode.Required)
  .regex(
    /^(v\d)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/g,
    ValidatorCode.InvalidFormat,
  );

export { tokenValidator };
