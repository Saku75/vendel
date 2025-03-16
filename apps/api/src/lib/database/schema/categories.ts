import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const categories = sqliteTable("categories", {
  // Internal ID
  id: text("id", { length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Name
  name: text("name", { length: 50 }).notNull().unique(),

  // Timestamps
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { categories };
