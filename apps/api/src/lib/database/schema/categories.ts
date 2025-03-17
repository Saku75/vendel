import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const categoriesSchema = sqliteTable("categories", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Name
  name: text({ length: 50 }).notNull().unique(),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { categoriesSchema };
