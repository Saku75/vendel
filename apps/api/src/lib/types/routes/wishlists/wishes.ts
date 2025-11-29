import { wishes } from "$lib/database/schema/wishes";

type WishesListRequest = {
  wishlistId: string;
};
type WishesListResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>[];

type WishesGetRequest = {
  wishlistId: string;
  wishId: string;
};
type WishesGetResponse = Omit<
  typeof wishes.$inferSelect,
  "createdAt" | "updatedAt"
>;

export type {
  WishesGetRequest,
  WishesGetResponse,
  WishesListRequest,
  WishesListResponse,
};
