import { eq } from "drizzle-orm";
import { z } from "zod";

import { MailTemplate } from "@repo/mail";
import { TokenPurpose } from "@repo/token";
import { ValidatorCodes } from "@repo/validators";
import { captchaValidator } from "@repo/validators/captcha";
import { idValidator } from "@repo/validators/id";
import { passwordHashValidator } from "@repo/validators/password";

import { users } from "$lib/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { app } from "$lib/utils/app";

import { SignUpSession, signUpSessionKey } from "./sign-up";
import { scrypt } from "./utils/scrypt";
import { signIn } from "./utils/sign-in";

const signUpFinishSchema = z.object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signUpFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signUpFinishSchema>>();
  const session = await c.env.KV.get<SignUpSession>(
    signUpSessionKey(body.sessionId),
    { type: "json" },
  );

  const parsedBody = await signUpFinishSchema
    .superRefine(async (values, context) => {
      if (!session) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidatorCodes.NotFound,
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
          code: z.ZodIssueCode.custom,
          message: ValidatorCodes.Invalid,
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
    c.env.KV.delete(signUpSessionKey(data.sessionId)),
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

  await signIn(c, userId);

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
