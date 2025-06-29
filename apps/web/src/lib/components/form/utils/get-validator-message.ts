import { validatorMessage, type ValidatorCode } from "@package/validators";

function getValidatorMessage(
  code: ValidatorCode,
  messages?: Record<Partial<ValidatorCode>, string>,
) {
  if (messages) return messages[code];
  return validatorMessage[code];
}

export { getValidatorMessage };
