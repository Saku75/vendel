import z from "zod";

import { wishlists } from "$lib/database/schema/wishlists";

import { wishlistsSchema } from "$routes/wishlists";

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
