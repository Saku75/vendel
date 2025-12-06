import { eq } from "drizzle-orm";
import { object } from "zod/mini";

import { TokenPurpose } from "@package/token-service";
import { tokenValidator } from "@package/validators/token";

import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import { tokenService } from "$lib/services/token";
import type { ConfirmEmailRequest, ConfirmEmailResponse } from "$lib/types";
import type { UserConfirmEmailToken } from "$lib/types/user/tokens/confirm-email";

const confirmEmailSchema = object({
  token: tokenValidator,
});

const confirmEmailServer = createServer();

confirmEmailServer.post("/", async (c) => {
  const body = await c.req.json<ConfirmEmailRequest>();

  const parsedBody = await confirmEmailSchema.safeParseAsync(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.issues },
    });
  }

  const { data } = parsedBody;

  let tokenResult;
  try {
    tokenResult = await tokenService.read<UserConfirmEmailToken>(data.token);
  } catch {
    return response(c, {
      status: 400,
      content: { message: "Invalid or expired token" },
    });
  }

  if (
    !tokenResult.verified ||
    tokenResult.expired ||
    tokenResult.token.metadata.purpose !== TokenPurpose.ConfirmEmail
  ) {
    return response(c, {
      status: 400,
      content: { message: "Invalid or expired token" },
    });
  }

  const { userId } = tokenResult.token.data;

  const [user] = await db
    .update(users)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  if (!user) {
    return response(c, {
      status: 404,
      content: { message: "User not found" },
    });
  }

  return response<ConfirmEmailResponse>(c, {
    status: 200,
    content: { message: "Email verified successfully" },
  });
});

export { confirmEmailSchema, confirmEmailServer };
