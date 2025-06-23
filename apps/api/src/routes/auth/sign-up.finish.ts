import { scryptAsync } from "@noble/hashes/scrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { MailTemplate } from "@repo/mail";
import { TokenPurpose } from "@repo/token";
import { ValidatorCodes } from "@repo/validators";
import { captchaValidator } from "@repo/validators/captcha";
import { idValidator } from "@repo/validators/id";
import { passwordHashValidator } from "@repo/validators/password";

import { users } from "$lib/database/schema/users";
import { ApiResponse } from "$lib/types/response";
import { app } from "$lib/utils/app";

import { SignUpFinishResponse, SignUpSession } from "./sign-up";

const signUpFinishSchema = z.object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signUpFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signUpFinishSchema>>();
  const session = await c.env.KV.get<SignUpSession>(
    `auth:sign-up:session:${body.sessionId}`,
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
      { status: 400, errors: parsedBody.error!.errors } satisfies ApiResponse,
      400,
    );

  const { data } = parsedBody;

  const passwordServerHash = await scryptAsync(
    data.passwordClientHash,
    session.serverSalt,
    { N: 2 ** 17, r: 8, p: 1, dkLen: 256 },
  );

  const [user] = await Promise.all([
    c.var.database
      .update(users)
      .set({
        password: Buffer.from(passwordServerHash),
      })
      .where(eq(users.id, session.userId))
      .returning({
        firstName: users.firstName,
        email: users.email,
      }),
    c.env.KV.delete(`auth:sign-up:session:${data.sessionId}`),
  ]);
  const { firstName, email } = user[0];

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

  return c.json(
    {
      status: 201,
      data: { sessionId: data.sessionId },
    } satisfies ApiResponse<SignUpFinishResponse>,
    201,
  );
});

export { signUpFinishRoute, signUpFinishSchema };
