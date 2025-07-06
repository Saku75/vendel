import { eq } from "drizzle-orm";
import { object, ZodIssueCode, type z } from "zod";

import { MailTemplate } from "@package/mail";
import { TokenPurpose } from "@package/token";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";

import { AuthStatus } from "$lib/enums";
import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";

const emailSendSchema = object({
  captcha: captchaValidator,
});

type EmailSendRequest = z.infer<typeof emailSendSchema>;

const emailSendRoute = app();

emailSendRoute.post("/", async (c) => {
  if (c.var.auth.status !== AuthStatus.Authenticated)
    return c.json(
      {
        ok: false,
        status: 401,
        message: "Not authenticated",
      } satisfies Err,
      401,
    );

  const body = await c.req.json<z.infer<typeof emailSendSchema>>();
  const captchaIdempotencyKey = c.var.captcha.createIdempotencyKey();

  const parsedBody = await emailSendSchema
    .superRefine(async (values, context) => {
      if (!(await c.var.captcha.verify(values.captcha, captchaIdempotencyKey)))
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Invalid,
          path: ["captcha"],
        });
    })
    .safeParseAsync(body);

  if (!parsedBody.success)
    return c.json(
      { ok: false, status: 400, errors: parsedBody.error.errors } satisfies Err,
      400,
    );

  const user = await c.var.database
    .select({
      id: users.id,
      firstName: users.firstName,
      email: users.email,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.id, c.var.auth.user.id));

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

  const { firstName, email, emailVerified } = user[0];

  if (emailVerified) {
    return c.json(
      {
        ok: false,
        status: 400,
        message: "Email already verified",
      } satisfies Err,
      400,
    );
  }

  const confirmEmailToken = c.var.token.create<ConfirmEmailTokenData>(
    {
      userId: c.var.auth.user.id,
    },
    {
      purpose: TokenPurpose.ConfirmEmail,
    },
  );

  await c.var.mail.send({
    to: {
      name: firstName,
      address: email,
    },
    template: MailTemplate.ConfirmEmail,
    data: {
      name: firstName,
      token: confirmEmailToken,
    },
  });

  return c.json({
    ok: true,
    status: 200,
    message: "Confirmation email sent",
  } satisfies Ok);
});

export { emailSendRoute, emailSendSchema };
export type { EmailSendRequest };
