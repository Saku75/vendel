import type { userEmails } from "$lib/database/schema/user-emails";
import type { users } from "$lib/database/schema/users";

type TestUserEmail = Pick<
  typeof userEmails.$inferSelect,
  "email" | "verified" | "primary"
>;

type TestUser = Pick<
  typeof users.$inferSelect,
  | "id"
  | "firstName"
  | "middleName"
  | "lastName"
  | "role"
  | "approved"
  | "approvedBy"
> & {
  emails: TestUserEmail[];
  password: string;
};

export type { TestUser, TestUserEmail };
