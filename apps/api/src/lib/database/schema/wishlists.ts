import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const wishlistsSchema = sqliteTable("wishlists", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Content
  name: text({ length: 100 }).notNull().unique(),
  date: text({ length: 10 }),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { wishlistsSchema };
