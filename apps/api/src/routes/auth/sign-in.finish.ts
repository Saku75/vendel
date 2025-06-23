import { scryptAsync } from "@noble/hashes/scrypt";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { ValidatorCodes } from "@repo/validators";
import { captchaValidator } from "@repo/validators/captcha";
import { idValidator } from "@repo/validators/id";
import { passwordHashValidator } from "@repo/validators/password";

import { users } from "$lib/database/schema/users";
import { ApiResponse } from "$lib/types/response";
import { app } from "$lib/utils/app";

import { SignInFinishResponse, SignInSession } from "./sign-in";

const signInFinishSchema = z.object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signInFinishRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signInFinishSchema>>();
  const session = await c.env.KV.get<SignInSession>(
    `auth:sign-in:session:${body.sessionId}`,
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

      if (!c.var.captcha.verify(values.captcha, session.captchaIdempotencyKey))
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: ValidatorCodes.Invalid,
          path: ["captcha"],
        });
    })
    .safeParseAsync(body);

  if (!parsedBody.success || !session)
    return c.json(
      { status: 400, errors: parsedBody.error!.errors } satisfies ApiResponse,
      400,
    );

  const { data } = parsedBody;

  const passwordServerHash = await scryptAsync(
    data.passwordClientHash,
    session.serverSalt,
    { N: 2 ** 17, r: 8, p: 1, dkLen: 256 },
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
    c.env.KV.delete(`auth:sign-in:session:${data.sessionId}`),
  ]);

  if (user.length && session.userExists) {
    return c.json(
      {
        status: 200,
        data: { sessionId: data.sessionId },
      } satisfies ApiResponse<SignInFinishResponse>,
      200,
    );
  } else {
    return c.json(
      {
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
      } satisfies ApiResponse,
      400,
    );
  }
});

export { signInFinishRoute, signInFinishSchema };
