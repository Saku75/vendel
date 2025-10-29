import type { AuthRole } from "$lib/enums/auth/role";

interface TestUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AuthRole;
}

type TestUsers = {
  readonly SUPER_ADMIN: TestUser;
  readonly ADMIN: TestUser;
  readonly USER_ONE: TestUser;
  readonly USER_TWO: TestUser;
};

export type { TestUser, TestUsers };
