import { sql } from "drizzle-orm";
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { AuthRole } from "$lib/enums/auth/role";

import { enumValues } from "../utils";

const users = sqliteTable("users", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  firstName: text({ length: 64 }).notNull(),
  middleName: text({ length: 256 }),
  lastName: text({ length: 64 }),

  role: text({
    length: 16,
    enum: enumValues(AuthRole),
  })
    .notNull()
    .default(AuthRole.Guest),

  approved: int({ mode: "boolean" }).notNull().default(false),
  approvedBy: text({ length: 24 }).references((): AnySQLiteColumn => users.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`)
    .$onUpdate(() => new Date()),
});

export { users };
