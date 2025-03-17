import { createId } from "@paralleldrive/cuid2";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { refreshTokenFamiliesSchema } from "./refresh-token-families";

const refreshTokensSchema = sqliteTable("refresh_tokens", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Refresh Token Family ID
  refreshTokenFamilyId: text({ length: 24 })
    .notNull()
    .references(() => refreshTokenFamiliesSchema.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  // Content
  expires: int({ mode: "timestamp" })
    .notNull()
    .$default(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }),
  used: int({ mode: "boolean" }).notNull().default(false),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { refreshTokensSchema };
