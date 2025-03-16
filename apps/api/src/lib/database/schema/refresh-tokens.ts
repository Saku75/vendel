import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { refreshTokenFamilies } from "./refresh-token-families";

const refreshTokens = sqliteTable("refresh_tokens", {
  // Internal ID
  id: text("id", { length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Refresh Token Family ID
  refreshTokenFamilyId: text("refresh_token_family_id", { length: 24 })
    .notNull()
    .references(() => refreshTokenFamilies.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  // Content
  expires: int("expires", { mode: "timestamp" })
    .notNull()
    .$default(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }),
  used: int("used", { mode: "boolean" }).notNull().default(false),

  // Timestamps
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { refreshTokens };
