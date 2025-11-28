import { users } from "$lib/database/schema/users";

type WhoAmIResponse = {
  user: Omit<
    typeof users.$inferSelect,
    "password" | "clientSalt" | "serverSalt" | "createdAt" | "updatedAt"
  >;
  session: {
    expiresAt: number;
  };
};

export type { WhoAmIResponse };
