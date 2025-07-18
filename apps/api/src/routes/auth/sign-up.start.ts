import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { type z, object, ZodIssueCode } from "zod";

import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";
import {
  firstNameValidator,
  lastNameValidator,
  middleNameValidator,
} from "@package/validators/name";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { createFreshCaptchaValidatorWithKey } from "$lib/utils/validation/captcha";

import { setSignUpSession, SignUpStartResponse } from "./sign-up";

const signUpStartSchema = object({
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
          code: ZodIssueCode.custom,
          message: ValidatorCode.AlreadyExists,
          path: ["email"],
        });
    })
    .superRefine(createFreshCaptchaValidatorWithKey(c, captchaIdempotencyKey))
    .safeParseAsync(body);

  if (!parsedBody.success)
    return c.json(
      {
        ok: false,
        status: 400,
        errors: parsedBody.error.errors,
      } satisfies Err,
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

  await setSignUpSession(
    c,
    sessionId,
    {
      userId,
      serverSalt,
      captchaIdempotencyKey,
    },
    { expirationTtl: 60 },
  );

  return c.json(
    {
      ok: true,
      status: 201,
      data: { sessionId, clientSalt },
    } satisfies Ok<SignUpStartResponse>,
    201,
  );
});

export { signUpStartRoute, signUpStartSchema };
