import type { TestWishlist } from "../types/wishlist";

const testWishlists: Record<string, TestWishlist> = {
  Birthday: {
    id: "wishlist_birthday-id",
    name: "Birthday Wishlist",
    description: "Things I want for my birthday",
  },
  Christmas: {
    id: "wishlist_christmas-id",
    name: "Christmas Wishlist",
    description: "Holiday gift ideas",
  },
  Empty: {
    id: "wishlist_empty-id",
    name: "Empty Wishlist",
    description: null,
  },
} as const;

export { testWishlists };
