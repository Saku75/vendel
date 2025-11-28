import { eq } from "drizzle-orm";

import { MailTemplate } from "@package/mail-service";
import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";

import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { getAuth, requireAuth } from "$lib/server/middleware/require-auth";
import { response } from "$lib/server/response";
import { mailService } from "$lib/services/mail";
import { tokenService } from "$lib/services/token";
import type { ResendConfirmEmailResponse } from "$lib/types/routes/user/email/resend";
import type { UserConfirmEmailToken } from "$lib/types/user/tokens/confirm-email";

const resendConfirmEmailServer = createServer();

resendConfirmEmailServer.post("/", requireAuth(), async (c) => {
  const auth = getAuth(c);

  const [user] = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, auth.access.user.id));

  if (!user) {
    return response(c, {
      status: 404,
      content: { message: "User not found" },
    });
  }

  if (user.emailVerified) {
    return response(c, {
      status: 400,
      content: { message: "Email already verified" },
    });
  }

  const confirmEmailToken = await tokenService.create<UserConfirmEmailToken>(
    { userId: user.id },
    {
      purpose: TokenPurpose.ConfirmEmail,
      expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
    },
  );

  await mailService.send({
    to: {
      name: user.firstName,
      address: user.email,
    },
    template: MailTemplate.ConfirmEmail,
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
