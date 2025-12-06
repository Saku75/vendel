import { AuthRole } from "$lib/enums/auth/role";

import type { TestUser } from "../types/user";

const testUsers: Record<string, TestUser> = {
  SuperAdmin: {
    id: "super_admin-id",
    firstName: "Super",
    middleName: null,
    lastName: "Admin",
    email: "super_admin@example.com",
    emailVerified: true,
    password: "super_admin-password",
    role: AuthRole.SuperAdmin,
    approved: true,
    approvedBy: null,
  },
  Admin: {
    id: "admin_one-id",
    firstName: "Admin",
    middleName: null,
    lastName: "One",
    email: "admin_one@example.com",
    emailVerified: true,
    password: "admin_one-password",
    role: AuthRole.Admin,
    approved: true,
    approvedBy: "super_admin-id",
  },
  UserOne: {
    id: "user_one-id",
    firstName: "User",
    middleName: null,
    lastName: "One",
    email: "user_one@example.com",
    emailVerified: true,
    password: "user_one-password",
    role: AuthRole.User,
    approved: true,
    approvedBy: "admin_one-id",
  },
  UserTwo: {
    id: "user_two-id",
    firstName: "User",
    middleName: null,
    lastName: "Two",
    email: "user_two@example.com",
    emailVerified: false,
    password: "user_two-password",
    role: AuthRole.Guest,
    approved: false,
    approvedBy: null,
  },
} as const;

export { testUsers };
