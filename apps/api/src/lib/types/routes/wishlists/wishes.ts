import type { z } from "zod/mini";

import type { wishes } from "$lib/database/schema/wishes";

import type { wishesSchema } from "$routes/wishlists/wishes";

type WishesListRequest = undefined;
type WishesListResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishesGetRequest = undefined;
type WishesGetResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>;

type WishesCreateRequest = z.infer<typeof wishesSchema>;
type WishesCreateResponse = undefined;

type WishesUpdateRequest = z.infer<typeof wishesSchema>;
type WishesUpdateResponse = undefined;

type WishesDeleteRequest = undefined;
type WishesDeleteResponse = undefined;

export type {
  WishesCreateRequest,
  WishesCreateResponse,
  WishesDeleteRequest,
  WishesDeleteResponse,
  WishesGetRequest,
  WishesGetResponse,
  WishesListRequest,
  WishesListResponse,
  WishesUpdateRequest,
  WishesUpdateResponse,
};
