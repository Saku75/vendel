import { wishlists } from "$lib/database/schema/wishlists";

type TestWishlist = Pick<
  typeof wishlists.$inferSelect,
  "id" | "name" | "description"
>;

export type { TestWishlist };
