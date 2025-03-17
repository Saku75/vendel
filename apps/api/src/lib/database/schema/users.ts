import { createId } from "@paralleldrive/cuid2";
import {
  AnySQLiteColumn,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { AuthRole } from "../../enums/auth.role";

const usersSchema = sqliteTable("users", {
  // Internal ID
  id: text({ length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Name
  firstName: text({ length: 50 }).notNull(),
  middleName: text({ length: 200 }),
  lastName: text({ length: 50 }),

  // Credentials
  email: text({ length: 320 }).notNull().unique(),
  emailVerified: int({ mode: "boolean" }).notNull().default(false),
  password: text({ length: 128 }),
  clientSalt: text({ length: 64 }).notNull(),
  serverSalt: text({ length: 64 }).notNull(),

  // Role
  role: text({
    length: 20,
    enum: [AuthRole.SuperAdmin, AuthRole.Admin, AuthRole.User, AuthRole.Guest],
  }),

  // Approval
  approved: int({ mode: "boolean" }).notNull().default(false),
  approvedBy: text({ length: 24 }).references(
    (): AnySQLiteColumn => usersSchema.id,
    { onUpdate: "cascade", onDelete: "set null" },
  ),

  // Timestamps
  createdAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int({ mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { usersSchema };
