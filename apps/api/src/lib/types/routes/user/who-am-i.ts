import type { userEmails } from "$lib/database/schema/user-emails";
import type { users } from "$lib/database/schema/users";

type WhoAmIRequest = undefined;
type WhoAmIResponse = {
  user: Omit<typeof users.$inferSelect, "createdAt" | "updatedAt"> & {
    emails: Pick<
      typeof userEmails.$inferSelect,
      "email" | "verified" | "primary"
    >[];
  };
  session: {
    expiresAt: number;
  };
};

export type { WhoAmIRequest, WhoAmIResponse };
