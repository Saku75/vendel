enum ValidatorCode {
  Required = "required",
  NotFound = "not-found",
  AlreadyExists = "already-exists",

  TooShort = "too-short",
  TooLong = "too-long",
  TooSmall = "too-small",
  TooBig = "too-big",

  Invalid = "invalid",
  InvalidType = "invalid-type",
  InvalidFormat = "invalid-format",
}

const validatorMessage: Record<ValidatorCode, string> = {
  [ValidatorCode.Required]: "Feltet skal udfyldes.",
  [ValidatorCode.NotFound]: "Kunne ikke findes.",
  [ValidatorCode.AlreadyExists]: "Findes allerede.",

  [ValidatorCode.TooShort]: "Værdien er for kort.",
  [ValidatorCode.TooLong]: "Værdien er for lang.",
  [ValidatorCode.TooSmall]: "Værdien er for lille.",
  [ValidatorCode.TooBig]: "Værdien er for stor.",

  [ValidatorCode.Invalid]: "Ugyldig værdi.",
  [ValidatorCode.InvalidType]: "Ugyldig type.",
  [ValidatorCode.InvalidFormat]: "Ugyldigt format.",
};

export { ValidatorCode, validatorMessage };
