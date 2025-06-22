import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { ValidatorCodes } from "@repo/validators";
import { captchaValidator } from "@repo/validators/captcha";
import { emailValidator } from "@repo/validators/email";
import {
  firstNameValidator,
  lastNameValidator,
  middleNameValidator,
} from "@repo/validators/name";

import { users } from "$lib/database/schema/users";
import { ApiResponse } from "$lib/types/response";
import { app } from "$lib/utils/app";

import { SignUpSession, SignUpStartResponse } from "./sign-up";

const signUpStartSchema = z.object({
  firstName: firstNameValidator,
  middleName: middleNameValidator,
  lastName: lastNameValidator,

  email: emailValidator,

  captcha: captchaValidator,
});

const signUpStartRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signUpStartSchema>>();
  const captchaIdempotencyKey = c.var.captcha.createIdempotencyKey();

  const parsedBody = await signUpStartSchema
    .superRefine(async (values, context) => {
      if (await c.var.database.$count(users, eq(users.email, values.email)))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidatorCodes.AlreadyExists,
          path: ["email"],
        });

      if (!c.var.captcha.verify(values.captcha, captchaIdempotencyKey))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidatorCodes.Invalid,
          path: ["captcha"],
        });
    })
    .safeParseAsync(body);

  if (!parsedBody.success)
    return c.json(
      { status: 400, errors: parsedBody.error.errors } satisfies ApiResponse,
      400,
    );

  const { data } = parsedBody;

  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const user = await c.var.database
    .insert(users)
    .values({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      clientSalt: clientSalt,
      serverSalt: serverSalt,
    })
    .returning({ id: users.id });
  const { id: userId } = user[0];

  const sessionId = createId();

  await c.env.KV.put(
    `auth:sign-up:session:${sessionId}`,
    JSON.stringify({
      userId,
      serverSalt,
      captchaIdempotencyKey,
    } satisfies SignUpSession),
    { expirationTtl: 60 },
  );

  return c.json(
    {
      status: 201,
      data: { sessionId, clientSalt },
    } satisfies ApiResponse<SignUpStartResponse>,
    201,
  );
});

export { signUpStartRoute, signUpStartSchema };
