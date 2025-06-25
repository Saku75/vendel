import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { ValidatorCodes } from "@repo/validators";
import { captchaValidator } from "@repo/validators/captcha";
import { idValidator } from "@repo/validators/id";
import { passwordHashValidator } from "@repo/validators/password";

import { users } from "$lib/database/schema/users";
import { Err, Ok } from "$lib/types/result";
import { app } from "$lib/utils/app";

import { SignInSession, signInSessionKey } from "./sign-in";
import { scrypt } from "./utils/scrypt";
import { signIn } from "./utils/sign-in";

const signInFinishSchema = z.object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signInFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signInFinishSchema>>();
  const session = await c.env.KV.get<SignInSession>(
    signInSessionKey(body.sessionId),
    { type: "json" },
  );

  const parsedBody = await signInFinishSchema
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
          .select({ id: users.id })
          .from(users)
          .where(
            and(
              eq(users.id, session.userId),
              eq(users.password, Buffer.from(passwordServerHash)),
            ),
          )
      : c.var.database.select({ id: users.id }).from(users),
    c.env.KV.delete(signInSessionKey(data.sessionId)),
  ]);

  if (!user.length && !session.userExists) {
    return c.json(
      {
        ok: false,
        status: 400,
        errors: [
          {
            code: z.ZodIssueCode.custom,
            message: ValidatorCodes.Invalid,
            path: ["email"],
          },
          {
            code: z.ZodIssueCode.custom,
            message: ValidatorCodes.Invalid,
            path: ["password"],
          },
        ],
      } satisfies Err,
      400,
    );
  }

  await signIn(c, user[0].id);

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
