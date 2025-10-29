import {
  AnySQLiteColumn,
  blob,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { AuthRole } from "$lib/enums/auth/role";
import { createId } from "$lib/utils/create-id";

const users = sqliteTable("users", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Name
  firstName: text({ length: 64 }).notNull(),
  middleName: text({ length: 256 }),
  lastName: text({ length: 64 }),

  // Credentials
  email: text({ length: 320 }).notNull().unique(),
  emailVerified: int({ mode: "boolean" }).notNull().default(false),
  password: blob({ mode: "buffer" }),
  clientSalt: text({ length: 64 }).notNull(),
  serverSalt: text({ length: 64 }).notNull(),

  // Role
  role: text({
    length: 16,
    enum: [AuthRole.SuperAdmin, AuthRole.Admin, AuthRole.User, AuthRole.Guest],
  }),

  // Approval
  approved: int({ mode: "boolean" }).notNull().default(false),
  approvedBy: text({ length: 24 }).references((): AnySQLiteColumn => users.id, {
    onUpdate: "cascade",
    onDelete: "set null",
  }),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { users };
