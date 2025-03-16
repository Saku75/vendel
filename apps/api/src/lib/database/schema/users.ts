import { createId } from "@paralleldrive/cuid2";
import {
  AnySQLiteColumn,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { AuthRole } from "../../enums/auth.role";

const users = sqliteTable("users", {
  // Internal ID
  id: text("id", { length: 24 })
    .notNull()
    .primaryKey()
    .$default(() => createId()),

  // Name
  firstName: text("first_name", { length: 50 }).notNull(),
  middleName: text("middle_name", { length: 200 }),
  lastName: text("last_name", { length: 50 }),

  // Credentials
  email: text("email", { length: 320 }).notNull().unique(),
  emailVerified: int("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  password: text("password", { length: 128 }),
  clientSalt: text("client_salt", { length: 64 }).notNull(),
  serverSalt: text("server_salt", { length: 64 }).notNull(),

  // Role
  role: text("role", {
    length: 20,
    enum: [AuthRole.SuperAdmin, AuthRole.Admin, AuthRole.User, AuthRole.Guest],
  }),

  // Approval
  approved: int("approved", { mode: "boolean" }).notNull().default(false),
  approvedBy: text("approved_by", { length: 24 }).references(
    (): AnySQLiteColumn => users.id,
    { onUpdate: "cascade", onDelete: "set null" },
  ),

  // Timestamps
  createdAt: int("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
  updatedAt: int("updated_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date())
    .$onUpdate(() => new Date()),
});

export { users };
