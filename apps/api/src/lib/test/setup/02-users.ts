import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";

import { AuthRole } from "$lib/enums/auth/role";
import { users } from "$lib/server/database/schema/users";
import { scrypt } from "$lib/utils/scrypt";

// Test user credentials - these are the client hashes we'll use in tests
export const TEST_USERS = {
  SUPER_ADMIN: {
    id: "test_super_admin_001",
    email: "superadmin@test.com",
    password: "superadmin-password-hash", // Client hash for tests
    firstName: "Super",
    lastName: "Admin",
    role: AuthRole.SuperAdmin,
  },
  ADMIN: {
    id: "test_admin_002",
    email: "admin@test.com",
    password: "admin-password-hash", // Client hash for tests
    firstName: "Test",
    lastName: "Admin",
    role: AuthRole.Admin,
  },
  USER_ONE: {
    id: "test_user_one_003",
    email: "user1@test.com",
    password: "user1-password-hash", // Client hash for tests
    firstName: "User",
    lastName: "One",
    role: AuthRole.User,
  },
  USER_TWO: {
    id: "test_user_two_004",
    email: "user2@test.com",
    password: "user2-password-hash", // Client hash for tests
    firstName: "User",
    lastName: "Two",
    role: AuthRole.User,
  },
} as const;

const database = drizzle(env.DB, {
  casing: "snake_case",
});

// Setup test users with properly hashed passwords
for (const user of Object.values(TEST_USERS)) {
  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));
  
  // Hash the password using the same method as the real sign-up flow
  const passwordServerHash = await scrypt(user.password, serverSalt);
  
  await database.insert(users).values({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: Buffer.from(passwordServerHash),
    clientSalt,
    serverSalt,
    role: user.role,
    emailVerified: true, // Set to true for test users
    approved: true, // Set to true for test users
  });
}