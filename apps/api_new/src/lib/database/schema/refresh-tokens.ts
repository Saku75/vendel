import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { refreshTokenFamilies } from "./refresh-token-families";

const refreshTokens = sqliteTable("refresh_tokens", {
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  refreshTokenFamilyId: text({ length: 24 })
    .notNull()
    .references(() => refreshTokenFamilies.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  used: int({ mode: "boolean" }).notNull().default(false),

  expiresAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch() + 2592000)`),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export { refreshTokens };
