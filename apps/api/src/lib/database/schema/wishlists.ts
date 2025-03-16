import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const wishlists = sqliteTable("wishlists", {
  // Internal ID
  id: text("id", { length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Content
  name: text("name", { length: 100 }).notNull().unique(),
  date: text("date", { length: 10 }),

  // Timestamps
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { wishlists };
