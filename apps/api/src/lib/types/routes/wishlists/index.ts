import type { z } from "zod/mini";

import type { wishlists } from "$lib/database/schema/wishlists";

import type { wishlistsSchema } from "$routes/wishlists";

type WishlistsListRequest = undefined;
type WishlistsListResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishlistsGetRequest = undefined;
type WishlistsGetResponse = Omit<
  typeof wishlists.$inferSelect,
  "createdAt" | "updatedAt"
>;

type WishlistsCreateRequest = z.infer<typeof wishlistsSchema>;
type WishlistsCreateResponse = undefined;

type WishlistsUpdateRequest = z.infer<typeof wishlistsSchema>;
type WishlistsUpdateResponse = undefined;

type WishlistsDeleteRequest = undefined;
type WishlistsDeleteResponse = undefined;

export type {
  WishlistsCreateRequest,
  WishlistsCreateResponse,
  WishlistsDeleteRequest,
  WishlistsDeleteResponse,
  WishlistsGetRequest,
  WishlistsGetResponse,
  WishlistsListRequest,
  WishlistsListResponse,
  WishlistsUpdateRequest,
  WishlistsUpdateResponse,
};
