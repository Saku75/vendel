import { AuthRole } from "$lib/enums/auth/role";

import type { TestUsers } from "../types/user";

const TEST_USERS: TestUsers = {
  SUPER_ADMIN: {
    id: "test_super_admin_001",
    email: "superadmin@test.com",
    password: "superadmin-password-hash",
    firstName: "Super",
    lastName: "Admin",
    role: AuthRole.SuperAdmin,
  },
  ADMIN: {
    id: "test_admin_002",
    email: "admin@test.com",
    password: "admin-password-hash",
    firstName: "Test",
    lastName: "Admin",
    role: AuthRole.Admin,
  },
  USER_ONE: {
    id: "test_user_one_003",
    email: "user1@test.com",
    password: "user1-password-hash",
    firstName: "User",
    lastName: "One",
    role: AuthRole.User,
  },
  USER_TWO: {
    id: "test_user_two_004",
    email: "user2@test.com",
    password: "user2-password-hash",
    firstName: "User",
    lastName: "Two",
    role: AuthRole.User,
  },
};

export { TEST_USERS };
