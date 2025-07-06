import { eq } from "drizzle-orm";
import { object, ZodIssueCode, type z } from "zod";

import { TokenPurpose } from "@package/token";
import { ValidatorCode } from "@package/validators";
import { tokenValidator } from "@package/validators/token";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";

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

  let tokenResult;

  try {
    tokenResult = c.var.token.read<ConfirmEmailTokenData>(data.token);
  } catch {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["token"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  if (!tokenResult || !tokenResult.valid) {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["token"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  if (tokenResult.expired) {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Expired,
            path: ["token"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  if (tokenResult.payload.purpose !== TokenPurpose.ConfirmEmail) {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.InvalidType,
            path: ["token"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  const tokenData = tokenResult.payload.data;

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
