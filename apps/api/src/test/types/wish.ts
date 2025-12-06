import type { wishes } from "$lib/database/schema/wishes";

type TestWish = Pick<
  typeof wishes.$inferSelect,
  "id" | "wishlistId" | "title" | "brand" | "description" | "price" | "url"
>;

export type { TestWish };
