import { eq } from "drizzle-orm";
import { type z, object, ZodIssueCode } from "zod";

import { MailTemplate } from "@package/mail";
import { TokenPurpose } from "@package/token";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { signIn } from "$lib/utils/auth/flows/sign-in";
import { scrypt } from "$lib/utils/scrypt";

import { getSignUpSession, unsetSignUpSession } from "./sign-up";

const signUpFinishSchema = object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signUpFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signUpFinishSchema>>();
  const session = await getSignUpSession(c, body.sessionId);

  const parsedBody = await signUpFinishSchema
    .superRefine(async (values, context) => {
      if (!session) {
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.NotFound,
          path: ["sessionId"],
        });
        return;
      }

      if (
        !(await c.var.captcha.verify(
          values.captcha,
          session.captchaIdempotencyKey,
        ))
      )
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Invalid,
          path: ["captcha"],
        });
    })
    .safeParseAsync(body);

  if (!parsedBody.success || !session)
    return c.json(
      {
        ok: false,
        status: 400,
        errors: parsedBody.error!.errors,
      } satisfies Err,
      400,
    );

  const { data } = parsedBody;

  const passwordServerHash = await scrypt(
    data.passwordClientHash,
    session.serverSalt,
  );

  const [user] = await Promise.all([
    c.var.database
      .update(users)
      .set({
        password: Buffer.from(passwordServerHash),
      })
      .where(eq(users.id, session.userId))
      .returning({
        id: users.id,
        firstName: users.firstName,
        email: users.email,
      }),
    unsetSignUpSession(c, data.sessionId),
  ]);
  const { id: userId, firstName, email } = user[0];

  const confirmEmailToken = c.var.token.create({
    data: {
      userId: session.userId,
    },
    options: {
      purpose: TokenPurpose.ConfirmEmail,
    },
  });

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

  await signIn(c, { userId, userRole: null });

  return c.json(
    {
      ok: true,
      status: 201,
      message: "User signed up",
    } satisfies Ok,
    201,
  );
});

export { signUpFinishRoute, signUpFinishSchema };
