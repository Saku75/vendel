import { createId } from "@paralleldrive/cuid2";
import { int, real, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { categoriesSchema } from "./categories";
import { wishlistsSchema } from "./wishlists";

const wishesSchema = sqliteTable(
  "wishes",
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

    // Content
    categoryId: text({ length: 24 })
      .notNull()
      .references(() => categoriesSchema.id, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    title: text({ length: 100 }).notNull(),
    brand: text({ length: 50 }),
    description: text(),
    price: real(),
    link: text(),

    // Timestamps
    createdAt: int({ mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: int({ mode: "timestamp" })
      .notNull()
      .$default(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [unique().on(table.wishlistId, table.title)],
);

export { wishesSchema };
