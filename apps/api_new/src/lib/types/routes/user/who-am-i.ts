import { users } from "$lib/database/schema/users";

type WhoAmIResponse = Omit<
  typeof users.$inferSelect,
  "password" | "clientSalt" | "serverSalt" | "createdAt" | "updatedAt"
>;

export type { WhoAmIResponse };
