import type { z } from "zod/mini";

import type { wishes } from "$lib/database/schema/wishes";

import type { wishesSchema } from "$routes/wishlists/wishes";

type WishesListResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishesGetResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>;

type WishesCreateRequest = z.infer<typeof wishesSchema>;
type WishesCreateResponse = undefined;

type WishesUpdateRequest = z.infer<typeof wishesSchema>;
type WishesUpdateResponse = undefined;

type WishesDeleteResponse = undefined;

export type {
  WishesCreateRequest,
  WishesCreateResponse,
  WishesDeleteResponse,
  WishesGetResponse,
  WishesListResponse,
  WishesUpdateRequest,
  WishesUpdateResponse,
};
