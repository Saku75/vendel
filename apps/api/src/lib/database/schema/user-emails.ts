import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { users } from "./users";

const userEmails = sqliteTable("user_emails", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  userId: text({ length: 24 })
    .notNull()
    .references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  email: text({ length: 320 }).notNull().unique(),
  verified: int({ mode: "boolean" }).notNull().default(false),
  primary: int({ mode: "boolean" }).notNull().default(false),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export { userEmails };
