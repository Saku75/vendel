import { eq } from "drizzle-orm";
import { object } from "zod/mini";

import { bytesToHex, randomBytes } from "@package/crypto-utils/bytes";
import { createId } from "@package/crypto-utils/cuid";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { emailValidator } from "@package/validators/email";

import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type {
  SignInStartRequest,
  SignInStartResponse,
} from "$lib/types/routes/auth/sign-in";

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

  const [user] = await db
    .select({
      id: users.id,
      clientSalt: users.clientSalt,
      serverSalt: users.serverSalt,
    })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  const sessionId = createId();
  const userExists = !!user;

  const sessionData = {
    email: data.email,
    serverSalt: userExists ? user.serverSalt : bytesToHex(randomBytes(32)),
    captchaIdempotencyKey,
  };

  const clientSalt = userExists ? user.clientSalt : bytesToHex(randomBytes(32));

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
