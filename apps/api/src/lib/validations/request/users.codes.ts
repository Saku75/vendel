enum UserFirstNameValidationCode {
  Required = "first-name.required",
  TooLong = "first-name.too-long",
}

enum UserMiddleNameValidationCode {
  TooLong = "middle-name.too-long",
}

enum UserLastNameValidationCode {
  TooLong = "last-name.too-long",
}

enum UserEmailValidationCode {
  Required = "email.required",
  TooLong = "email.too-long",
  Invalid = "email.invalid",
  AlreadyExists = "email.already-exists",
}

enum UserRoleValidationCode {
  Invalid = "role.invalid",
}

export {
  UserEmailValidationCode,
  UserFirstNameValidationCode,
  UserLastNameValidationCode,
  UserMiddleNameValidationCode,
  UserRoleValidationCode,
};
