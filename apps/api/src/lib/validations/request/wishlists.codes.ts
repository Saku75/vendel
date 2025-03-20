enum WishlistNameValidationCode {
  Required = "name.required",
  TooLong = "name.too-long",
  AlreadyExists = "name.already-exists",
}

enum WishlistDateValidationCode {
  Invalid = "date.invalid",
}

export { WishlistDateValidationCode, WishlistNameValidationCode };
