import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "$lib/utils/create-id";

import { users } from "./users";

const refreshTokenFamilies = sqliteTable("refresh_token_families", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // User ID
  userId: text({ length: 24 })
    .notNull()
    .references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  // Status
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

export { refreshTokenFamilies };
