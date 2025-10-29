import { users } from "$lib/database/schema/users";

type TestUser = Pick<
  typeof users.$inferSelect,
  | "id"
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "emailVerified"
  | "role"
  | "approved"
  | "approvedBy"
> & {
  password: string;
};

export type { TestUser };
