import { eq } from "drizzle-orm";
import { object } from "zod/mini";

import { bytesToHex, randomBytes } from "@package/crypto-utils/bytes";
import { createId } from "@package/crypto-utils/cuid";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";

import { db } from "$lib/database";
import { userEmails } from "$lib/database/schema/user-emails";
import { userPasswords } from "$lib/database/schema/user-passwords";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type { SignInStartRequest, SignInStartResponse } from "$lib/types";

import { signInSessions } from "./index";

const signInStartSchema = object({
  email: emailValidator,

  captcha: captchaValidator,
});

const signInStartServer = createServer();

signInStartServer.post("/", async (c) => {
  const body = await c.req.json<SignInStartRequest>();
  const captchaIdempotencyKey = c.var.captcha.createIdempotencyKey();

  const parsedBody = signInStartSchema.safeParse(body);
  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.issues },
    });
  }

  const { data } = parsedBody;

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

  const credentials = await db
    .select({
      clientSalt: userPasswords.clientSalt,
      serverSalt: userPasswords.serverSalt,
    })
    .from(userEmails)
    .innerJoin(userPasswords, eq(userPasswords.userId, userEmails.userId))
    .where(eq(userEmails.email, data.email))
    .get();

  const sessionId = createId();
  const userExists = !!credentials;

  const sessionData = {
    email: data.email,
    serverSalt: userExists
      ? credentials.serverSalt
      : bytesToHex(randomBytes(32)),
    captchaIdempotencyKey,
  };

  const clientSalt = userExists
    ? credentials.clientSalt
    : bytesToHex(randomBytes(32));

  await signInSessions.set(sessionId, sessionData, { expirationTtl: 60 });

  return response<SignInStartResponse>(c, {
    status: 200,
    content: {
      data: {
        sessionId,
        clientSalt,
      },
    },
  });
});

export { signInStartSchema, signInStartServer };
