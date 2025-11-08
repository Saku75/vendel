import {
  AnySQLiteColumn,
  blob,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { createId } from "@package/crypto-utils/cuid";

import { AuthRole } from "$lib/enums/auth/role";

const users = sqliteTable("users", {
  id: text({ length: 24 })
    .primaryKey()
    .$default(() => createId()),

  firstName: text({ length: 64 }).notNull(),
  middleName: text({ length: 256 }),
  lastName: text({ length: 64 }),

  email: text({ length: 320 }).notNull().unique(),
  emailVerified: int({ mode: "boolean" }).notNull().default(false),
  password: blob({ mode: "buffer" }),
  clientSalt: text({ length: 64 }).notNull(),
  serverSalt: text({ length: 64 }).notNull(),

  role: text({
    length: 16,
    enum: [AuthRole.SuperAdmin, AuthRole.Admin, AuthRole.User, AuthRole.Guest],
  }),

  approved: int({ mode: "boolean" }).notNull().default(false),
  approvedBy: text({ length: 24 }).references((): AnySQLiteColumn => users.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),

  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { users };
