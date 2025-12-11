import { eq } from "drizzle-orm";
import { object } from "zod/mini";

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
import { userEmails } from "$lib/database/schema/user-emails";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type { SignUpStartRequest, SignUpStartResponse } from "$lib/types";

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

  const parsedBody = signUpStartSchema.safeParse(body);
  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.issues },
    });
  }

  const { data } = parsedBody;

  const existingEmail = await db
    .select({ id: userEmails.id })
    .from(userEmails)
    .where(eq(userEmails.email, data.email))
    .get();

  if (existingEmail) {
    return response(c, {
      status: 400,
      content: {
        errors: [
          {
            code: "custom",
            message: ValidatorCode.AlreadyExists,
            path: ["email"],
          },
        ],
      },
    });
  }

  const captchaValid = await c.var.captcha.verify(
    data.captcha,
    captchaIdempotencyKey,
  );
  if (!captchaValid) {
    return response(c, {
      status: 400,
      content: {
        errors: [
          { code: "custom", message: ValidatorCode.Invalid, path: ["captcha"] },
        ],
      },
    });
  }

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
