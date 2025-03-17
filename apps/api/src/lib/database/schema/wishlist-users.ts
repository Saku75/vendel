import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { usersSchema } from "./users";
import { wishlistsSchema } from "./wishlists";

const wishlistUsersSchema = sqliteTable(
  "wishlist_users",
  {
    // Internal ID
    id: text({ length: 24 })
      .notNull()
      .primaryKey()
      .$default(() => createId()),

    // Wishlist ID
    wishlistId: text({ length: 24 })
      .notNull()
      .references(() => wishlistsSchema.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    // User ID
    userId: text({ length: 24 })
      .notNull()
      .references(() => usersSchema.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),

    // Timestamps
    createdAt: int({ mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: int({ mode: "timestamp" })
      .notNull()
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.wishlistId, table.userId)],
);

export { wishlistUsersSchema };
