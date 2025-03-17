import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { usersSchema } from "./users";

const refreshTokenFamiliesSchema = sqliteTable("refresh_token_families", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // User ID
  userId: text({ length: 24 })
    .notNull()
    .references(() => usersSchema.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  // Content
  invalidated: int({ mode: "boolean" }).notNull().default(false),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { refreshTokenFamiliesSchema };
