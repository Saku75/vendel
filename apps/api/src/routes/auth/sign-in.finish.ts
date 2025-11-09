import { and, eq } from "drizzle-orm";
import { object, ZodIssueCode, type z } from "zod";

import { scrypt } from "@package/crypto-utils/scrypt";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { signIn } from "$lib/utils/auth/flows/sign-in";
import { createSessionCaptchaValidator } from "$lib/utils/validation/captcha";

import { getSignInSession, unsetSignInSession } from "./sign-in";

const signInFinishSchema = object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signInFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signInFinishSchema>>();
  const session = await getSignInSession(c, body.sessionId);

  const parsedBody = await signInFinishSchema
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
    session.userExists
      ? c.var.database
          .select({ id: users.id, role: users.role })
          .from(users)
          .where(
            and(
              eq(users.id, session.userId),
              eq(users.password, Buffer.from(passwordServerHash)),
            ),
          )
      : c.var.database.select({ id: users.id, role: users.role }).from(users),
    unsetSignInSession(c, data.sessionId),
  ]);

  if (!user.length || !session.userExists) {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["email"],
          },
          {
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["password"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  await signIn(c, { userId: user[0].id, userRole: user[0].role });

  return c.json(
    {
      ok: true,
      status: 200,
      message: "User signed in",
    } satisfies Ok,
    200,
  );
});

export { signInFinishRoute, signInFinishSchema };
