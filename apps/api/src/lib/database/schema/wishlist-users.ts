import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { users } from "./users";
import { wishlists } from "./wishlists";

const wishlistUsers = sqliteTable(
  "wishlist_users",
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

    // User ID
    userId: text("user_id", { length: 24 })
      .notNull()
      .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),

    // Timestamps
    createdAt: int("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: int("updated_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.wishlistId, table.userId)],
);

export { wishlistUsers };
