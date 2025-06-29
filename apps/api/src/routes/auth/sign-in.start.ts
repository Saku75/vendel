import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";

import { users } from "$lib/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { app } from "$lib/utils/app";

import {
  SignInSession,
  signInSessionKey,
  SignInStartResponse,
} from "./sign-in";

const signInStartSchema = z.object({
  email: emailValidator,

  captcha: captchaValidator,
});

const signInStartRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signInStartSchema>>();
  const captchaIdempotencyKey = c.var.captcha.createIdempotencyKey();

  const parsedBody = await signInStartSchema
    .superRefine(async (values, context) => {
      if (!(await c.var.captcha.verify(values.captcha, captchaIdempotencyKey)))
        context.addIssue({
          code: z.ZodIssueCode.custom,
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

  const { data } = parsedBody;

  const user = await c.var.database
    .select({
      id: users.id,
      clientSalt: users.clientSalt,
      serverSalt: users.serverSalt,
    })
    .from(users)
    .where(eq(users.email, data.email));

  const sessionId = createId();

  if (!user.length) {
    await c.env.KV.put(
      signInSessionKey(sessionId),
      JSON.stringify({
        userExists: false,
        serverSalt: bytesToHex(randomBytes(32)),
        captchaIdempotencyKey,
      } satisfies SignInSession),
      { expirationTtl: 60 },
    );

    return c.json(
      {
        ok: true,
        status: 200,
        data: {
          sessionId,
          clientSalt: bytesToHex(randomBytes(32)),
        },
      } satisfies Ok<SignInStartResponse>,
      200,
    );
  }

  await c.env.KV.put(
    signInSessionKey(sessionId),
    JSON.stringify({
      userExists: true,
      userId: user[0].id,
      serverSalt: user[0].serverSalt,
      captchaIdempotencyKey,
    } satisfies SignInSession),
    { expirationTtl: 60 },
  );

  return c.json(
    {
      ok: true,
      status: 200,
      data: {
        sessionId,
        clientSalt: user[0].clientSalt,
      },
    } satisfies Ok<SignInStartResponse>,
    200,
  );
});

export { signInStartRoute, signInStartSchema };
