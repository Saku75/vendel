import { users } from "$lib/database/schema/users";

import { AuthTokens } from "./tokens";

type AuthSessionUser = Pick<typeof users.$inferSelect, "id" | "role">;

interface AuthSession {
  tokens: AuthTokens;
  user: AuthSessionUser;
}

export type { AuthSession, AuthSessionUser };
