import { and, eq } from "drizzle-orm";

import { MailTemplate } from "@package/mail-service";
import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { db } from "$lib/database";
import { userEmails } from "$lib/database/schema/user-emails";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { getAuth, requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import { mailService } from "$lib/services/mail";
import { tokenService } from "$lib/services/token";
import type { ResendConfirmEmailResponse } from "$lib/types";
import type { UserConfirmEmailToken } from "$lib/types/user/tokens/confirm-email";

const resendConfirmEmailServer = createServer();

resendConfirmEmailServer.post("/", requireAuth(), async (c) => {
  const auth = getAuth(c);

  const [user, primaryEmail] = await Promise.all([
    db
      .select({
        id: users.id,
        firstName: users.firstName,
      })
      .from(users)
      .where(eq(users.id, auth.access.user.id))
      .get(),
    db
      .select({
        email: userEmails.email,
        verified: userEmails.verified,
      })
      .from(userEmails)
      .where(
        and(
          eq(userEmails.userId, auth.access.user.id),
          eq(userEmails.primary, true),
        ),
      )
      .get(),
  ]);

  if (!user || !primaryEmail) {
    return response(c, {
      status: 404,
      content: { message: "User not found" },
    });
  }

  if (primaryEmail.verified) {
    return response(c, {
      status: 400,
      content: { message: "Email already verified" },
    });
  }

  const confirmEmailToken = await tokenService.create<UserConfirmEmailToken>(
    { userId: user.id, email: primaryEmail.email },
    {
      purpose: TokenPurpose.ConfirmEmail,
      expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
    },
  );

  await mailService.send({
    to: {
      name: user.firstName,
      address: primaryEmail.email,
    },
    template: MailTemplate.ConfirmEmailResend,
    data: {
      name: user.firstName,
      token: confirmEmailToken.token,
    },
  });

  return response<ResendConfirmEmailResponse>(c, {
    status: 200,
    content: { message: "Confirmation email sent" },
  });
});

export { resendConfirmEmailServer };
