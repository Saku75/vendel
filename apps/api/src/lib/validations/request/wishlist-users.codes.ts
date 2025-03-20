enum WishlistUserWishlistIdValidationCode {
  Required = "wishlist-id.required",
  Invalid = "wishlist-id.too-long",
  AlreadyExists = "wishlist-id.already-exists",
}

enum WishlistUserUserIdValidationCode {
  Required = "user-id.required",
  Invalid = "user-id.too-long",
  AlreadyExists = "user-id.already-exists",
}

export {
  WishlistUserUserIdValidationCode,
  WishlistUserWishlistIdValidationCode,
};
