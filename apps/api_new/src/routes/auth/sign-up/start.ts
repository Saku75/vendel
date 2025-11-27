import { eq } from "drizzle-orm";
import { object, ZodIssueCode } from "zod";

import { bytesToHex, randomBytes } from "@package/crypto-utils/bytes";
import { createId } from "@package/crypto-utils/cuid";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";
import {
  firstNameValidator,
  lastNameValidator,
  middleNameValidator,
} from "@package/validators/name";

import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type {
  SignUpStartRequest,
  SignUpStartResponse,
} from "$lib/types/routes/auth/sign-up";

import { signUpSessions } from "./index";

const signUpStartSchema = object({
  firstName: firstNameValidator,
  middleName: middleNameValidator,
  lastName: lastNameValidator,

  email: emailValidator,

  captcha: captchaValidator,
});

const signUpStartServer = createServer();

signUpStartServer.post("/", async (c) => {
  const body = await c.req.json<SignUpStartRequest>();
  const captchaIdempotencyKey = c.var.captcha.createIdempotencyKey();

  const parsedBody = await signUpStartSchema
    .superRefine(async (values, context) => {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, values.email))
        .limit(1);

      if (existingUser.length > 0) {
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.AlreadyExists,
          path: ["email"],
        });
      }
    })
    .superRefine(async (values, context) => {
      const result = await c.var.captcha.verify(
        values.captcha,
        captchaIdempotencyKey,
      );

      if (!result) {
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Invalid,
          path: ["captcha"],
        });
      }
    })
    .safeParseAsync(body);

  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.errors },
    });
  }

  const { data } = parsedBody;

  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const sessionId = createId();

  await signUpSessions.set(
    sessionId,
    {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      clientSalt,
      serverSalt,
      captchaIdempotencyKey,
    },
    { expirationTtl: 60 },
  );

  return response<SignUpStartResponse>(c, {
    status: 201,
    content: { data: { sessionId, clientSalt } },
  });
});

export { signUpStartSchema, signUpStartServer };
