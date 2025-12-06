import { and, eq } from "drizzle-orm";
import { object } from "zod/mini";

import { base64ToBytes } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { signIn } from "$lib/auth/flows/sign-in";
import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import type { SignInFinishRequest, SignInFinishResponse } from "$lib/types";

import { signInSessions } from "./index";

const signInFinishSchema = object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signInFinishServer = createServer();

signInFinishServer.post("/", async (c) => {
  const body = await c.req.json<SignInFinishRequest>();

  const parsedBody = signInFinishSchema.safeParse(body);
  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.issues },
    });
  }

  const { data } = parsedBody;

  const session = await signInSessions.get(data.sessionId);
  if (!session) {
    return response(c, {
      status: 400,
      content: {
        errors: [
          {
            code: "custom",
            message: ValidatorCode.NotFound,
            path: ["sessionId"],
          },
        ],
      },
    });
  }

  const captchaValid = await c.var.captcha.verify(
    data.captcha,
    session.captchaIdempotencyKey,
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

  const passwordServerHash = await scrypt(
    base64ToBytes(data.passwordClientHash),
    session.serverSalt,
  );

  const [user] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(
      and(
        eq(users.email, session.email),
        eq(users.password, Buffer.from(passwordServerHash)),
      ),
    )
    .limit(1);

  await signInSessions.delete(data.sessionId);

  if (!user) {
    return response(c, {
      status: 401,
      content: { message: "Invalid email or password" },
    });
  }

  await signIn(c, { userId: user.id, userRole: user.role });

  return response<SignInFinishResponse>(c, {
    status: 200,
    content: { message: "User signed in" },
  });
});

export { signInFinishSchema, signInFinishServer };
