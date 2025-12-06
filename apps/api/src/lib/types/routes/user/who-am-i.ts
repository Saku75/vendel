import type { users } from "$lib/database/schema/users";

type WhoAmIRequest = undefined;
type WhoAmIResponse = {
  user: Omit<
    typeof users.$inferSelect,
    "password" | "clientSalt" | "serverSalt" | "createdAt" | "updatedAt"
  >;
  session: {
    expiresAt: number;
  };
};

export type { WhoAmIRequest, WhoAmIResponse };
