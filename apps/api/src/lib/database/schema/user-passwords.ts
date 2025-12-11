import { sql } from "drizzle-orm";
import { blob, int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { enumValues } from "$lib/database/utils";
import { AuthPasswordVersion } from "$lib/enums/auth/password-version";

import { users } from "./users";

const userPasswords = sqliteTable("user_passwords", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  userId: text({ length: 24 })
    .notNull()
    .references(() => users.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),

  passwordHash: blob({ mode: "buffer" }).notNull(),
  clientSalt: text({ length: 64 }).notNull(),
  serverSalt: text({ length: 64 }).notNull(),

  version: text({ length: 16, enum: enumValues(AuthPasswordVersion) })
    .notNull()
    .default(AuthPasswordVersion.V1),
  current: int({ mode: "boolean" }).notNull().default(true),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export { userPasswords };
