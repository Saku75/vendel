import { wishlists } from "$lib/database/schema/wishlists";

type WishlistsListResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishlistsGetRequest = {
  wishlistId: string;
};
type WishlistsGetResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>;

export type {
  WishlistsGetRequest,
  WishlistsGetResponse,
  WishlistsListResponse,
};
