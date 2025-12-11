import { eq } from "drizzle-orm";

import { db } from "$lib/database";
import { userEmails } from "$lib/database/schema/user-emails";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { getAuth, requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import type { WhoAmIResponse } from "$lib/types";

const whoAmIServer = createServer();

whoAmIServer.get("/", requireAuth(), async (c) => {
  const auth = getAuth(c);

  const [user, emails] = await Promise.all([
    db
      .select({
        id: users.id,
        firstName: users.firstName,
        middleName: users.middleName,
        lastName: users.lastName,
        role: users.role,
        approved: users.approved,
        approvedBy: users.approvedBy,
      })
      .from(users)
      .where(eq(users.id, auth.access.user.id))
      .get(),
    db
      .select({
        email: userEmails.email,
        verified: userEmails.verified,
        primary: userEmails.primary,
      })
      .from(userEmails)
      .where(eq(userEmails.userId, auth.access.user.id)),
  ]);

  if (!user) {
    return response(c, {
      status: 404,
      content: { message: "User not found" },
    });
  }

  return response<WhoAmIResponse>(c, {
    status: 200,
    content: {
      data: {
        user: { ...user, emails },
        session: { expiresAt: auth.access.expiresAt },
      },
    },
  });
});

export { whoAmIServer };
