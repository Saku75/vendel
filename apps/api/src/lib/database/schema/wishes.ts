import { createId } from "@paralleldrive/cuid2";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { wishlists } from "./wishlists";

const wishes = sqliteTable(
  "wishes",
  {
    // Internal ID
    id: text("id", { length: 24 })
      .notNull()
      .primaryKey()
      .$default(() => createId()),

    // Wishlist ID
    wishlistId: text("wishlist_id", { length: 24 })
      .notNull()
      .references(() => wishlists.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    // Content
    categoryId: text("category_id", { length: 24 }).notNull(),
    title: text("title", { length: 100 }).notNull(),
    brand: text("brand", { length: 50 }),
    description: text("description"),
    price: real("price"),
    link: text("link"),

    // Timestamps
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.wishlistId, table.title)],
);

export { wishes };
