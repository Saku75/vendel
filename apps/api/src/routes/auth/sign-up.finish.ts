import { eq } from "drizzle-orm";
import { type z, object, ZodIssueCode } from "zod";

import { scrypt } from "@package/crypto-utils/scrypt";
import { MailTemplate } from "@package/mail-service";
import { TokenPurpose } from "@package/token-service";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";
import { signIn } from "$lib/utils/auth/flows/sign-in";
import { createSessionCaptchaValidator } from "$lib/utils/validation/captcha";

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
    })
    .superRefine(
      session
        ? createSessionCaptchaValidator(c, session.captchaIdempotencyKey)
        : async () => {},
    )
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

  const confirmEmailToken = await c.var.token.create<ConfirmEmailTokenData>(
    {
      userId: session.userId,
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
      token: confirmEmailToken.token,
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
