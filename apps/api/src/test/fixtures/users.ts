import { AuthRole } from "$lib/enums/auth/role";

import type { TestUser } from "../types/user";

const testUsers = {
  SuperAdmin: {
    id: "super_admin-id",
    firstName: "Super",
    middleName: null,
    lastName: "Admin",
    emails: [
      { email: "super_admin@example.com", verified: true, primary: true },
    ],
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
    emails: [{ email: "admin_one@example.com", verified: true, primary: true }],
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
    emails: [{ email: "user_one@example.com", verified: true, primary: true }],
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
    emails: [{ email: "user_two@example.com", verified: false, primary: true }],
    password: "user_two-password",
    role: AuthRole.Guest,
    approved: false,
    approvedBy: null,
  },
} as const satisfies Record<string, TestUser>;

export { testUsers };
