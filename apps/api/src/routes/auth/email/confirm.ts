import { eq } from "drizzle-orm";
import { object, type z } from "zod";

import { TokenPurpose } from "@package/token-service";
import { tokenValidator } from "@package/validators/token";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";
import { validateToken } from "$lib/utils/validation/token";

const emailConfirmSchema = object({
  token: tokenValidator,
});

type EmailConfirmRequest = z.infer<typeof emailConfirmSchema>;

const emailConfirmRoute = app();

emailConfirmRoute.post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof emailConfirmSchema>>();

  const parsedBody = emailConfirmSchema.safeParse(body);

  if (!parsedBody.success)
    return c.json(
      { ok: false, status: 400, errors: parsedBody.error.errors } satisfies Err,
      400,
    );

  const { data } = parsedBody;

  const tokenValidation = await validateToken<ConfirmEmailTokenData>(
    c,
    data.token,
    TokenPurpose.ConfirmEmail,
  );

  if (!tokenValidation.success) {
    return c.json(tokenValidation.error, tokenValidation.error.status);
  }

  const tokenData = tokenValidation.data;

  const user = await c.var.database
    .select({
      id: users.id,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, tokenData.userId));

  if (!user.length) {
    return c.json(
      {
        ok: false,
        status: 404,
        message: "User not found",
      } satisfies Err,
      404,
    );
  }

  if (user[0].emailVerified) {
    return c.json(
      {
        ok: false,
        status: 400,
        message: "Email already verified",
      } satisfies Err,
      400,
    );
  }

  await c.var.database
    .update(users)
    .set({
      emailVerified: true,
    })
    .where(eq(users.id, tokenData.userId));

  return c.json({
    ok: true,
    status: 200,
    message: "Email confirmed successfully",
  } satisfies Ok);
});

export { emailConfirmRoute, emailConfirmSchema };
export type { EmailConfirmRequest };
