import { eq } from "drizzle-orm";

import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { getAuth, requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import type { WhoAmIResponse } from "$lib/types";

const whoAmIServer = createServer();

whoAmIServer.get("/", requireAuth(), async (c) => {
  const auth = getAuth(c);

  const user = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      email: users.email,
      emailVerified: users.emailVerified,
      role: users.role,
      approved: users.approved,
      approvedBy: users.approvedBy,
    })
    .from(users)
    .where(eq(users.id, auth.access.user.id))
    .get();

  if (!user) {
    return response(c, {
      status: 404,
      content: { message: "User not found" },
    });
  }

  return response<WhoAmIResponse>(c, {
    status: 200,
    content: {
      data: { user, session: { expiresAt: auth.access.expiresAt } },
    },
  });
});

export { whoAmIServer };
