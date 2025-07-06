import { AuthRole } from "$lib/enums/auth/role";
import type { TestUsers } from "$lib/test/types/user";

// Test user credentials - these are the client hashes we'll use in tests
const TEST_USERS: TestUsers = {
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
};

export { TEST_USERS };
