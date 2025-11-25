import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { users } from "./users";

const refreshTokenFamilies = sqliteTable("refresh_token_families", {
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  userId: text({ length: 24 })
    .notNull()
    .references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  invalidated: int({ mode: "boolean" }).notNull().default(false),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export { refreshTokenFamilies };
