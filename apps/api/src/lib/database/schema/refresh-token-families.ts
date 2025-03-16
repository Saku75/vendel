import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { users } from "./users";

const refreshTokenFamilies = sqliteTable("refresh_token_families", {
  // Internal ID
  id: text("id", { length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // User ID
  userId: text("user_id", { length: 24 })
    .notNull()
    .references(() => users.id, { onUpdate: "cascade", onDelete: "cascade" }),

  // Content
  invalidated: int("invalidated", { mode: "boolean" }).notNull().default(false),

  // Timestamps
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { refreshTokenFamilies };
