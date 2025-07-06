import { eq } from "drizzle-orm";
import { type z, object, ZodIssueCode } from "zod";

import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { tokenValidator } from "@package/validators/token";

import { app } from "$lib/server";
import { users } from "$lib/server/database/schema/users";
import { ConfirmEmailTokenData } from "$lib/types/auth/token";
import { Err, Ok } from "$lib/types/result";

const confirmEmailRoute = app();

const confirmEmailSchema = object({
  token: tokenValidator,

  captcha: captchaValidator,
});

type ConfirmEmailRequest = z.infer<typeof confirmEmailSchema>;

confirmEmailRoute.post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof confirmEmailSchema>>();

  const parsedBody = await confirmEmailSchema
    .superRefine(async (values, context) => {
      if (!(await c.var.captcha.verify(values.captcha)))
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Invalid,
          path: ["captcha"],
        });

      const tokenContent = c.var.token.read<ConfirmEmailTokenData>(
        values.token,
      );

      if (!tokenContent.valid)
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Invalid,
          path: ["token"],
        });

      if (tokenContent.expired)
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.Expired,
          path: ["token"],
        });

      const user = await c.var.database.$count(
        users,
        eq(users.id, tokenContent.payload.data.userId),
      );

      if (!user)
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.NotFound,
          path: ["token"],
        });
    })
    .safeParseAsync(body);

  if (!parsedBody.success)
    return c.json(
      { ok: false, status: 400, errors: parsedBody.error.errors } satisfies Err,
      400,
    );

  const { data } = parsedBody;

  const tokenContent = c.var.token.read<ConfirmEmailTokenData>(data.token);

  await c.var.database
    .update(users)
    .set({
      emailVerified: true,
    })
    .where(eq(users.id, tokenContent.payload.data.userId));

  return c.json({
    ok: true,
    status: 200,
    message: "Email confirmed",
  } satisfies Ok);
});

export { confirmEmailRoute };
export type { ConfirmEmailRequest };
