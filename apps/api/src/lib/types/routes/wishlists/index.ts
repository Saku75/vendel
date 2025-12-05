import type { z } from "zod/mini";

import type { wishlists } from "$lib/database/schema/wishlists";

import type { wishlistsSchema } from "$routes/wishlists";

type WishlistsListResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishlistsGetResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>;

type WishlistsCreateRequest = z.infer<typeof wishlistsSchema>;
type WishlistsCreateResponse = undefined;

type WishlistsUpdateRequest = z.infer<typeof wishlistsSchema>;
type WishlistsUpdateResponse = undefined;

type WishlistsDeleteResponse = undefined;

export type {
  WishlistsCreateRequest,
  WishlistsCreateResponse,
  WishlistsDeleteResponse,
  WishlistsGetResponse,
  WishlistsListResponse,
  WishlistsUpdateRequest,
  WishlistsUpdateResponse,
};
