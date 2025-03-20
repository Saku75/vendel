enum WishCategoryIdValidationCode {
  Required = "category-id.required",
  Invalid = "category-id.invalid",
  DoesNotExists = "category-id.does-not-exists",
}

enum WishTitleValidationCode {
  Required = "title.required",
  TooLong = "title.too-long",
  AlreadyExists = "title.already-exists",
}

enum WishBrandValidationCode {
  TooLong = "brand.too-long",
}

enum WishDescriptionValidationCode {
  TooLong = "description.too-long",
}

enum WishPriceValidationCode {
  Negativ = "price.negativ",
}

enum WishLinkValidationCode {
  TooLong = "link.too-long",
  Invalid = "link.invalid",
}

export {
  WishBrandValidationCode,
  WishCategoryIdValidationCode,
  WishDescriptionValidationCode,
  WishLinkValidationCode,
  WishPriceValidationCode,
  WishTitleValidationCode,
};
