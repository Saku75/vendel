import { object, ZodIssueCode } from "zod";

import { scrypt } from "@package/crypto-utils/scrypt";
import { MailTemplate } from "@package/mail-service";
import {
  TokenExpiresIn,
  TokenPurpose,
  TokenService,
} from "@package/token-service";
import { ValidatorCode } from "@package/validators";
import { captchaValidator } from "@package/validators/captcha";
import { idValidator } from "@package/validators/id";
import { passwordHashValidator } from "@package/validators/password";

import { signIn } from "$lib/auth/flows/sign-in";
import { db } from "$lib/database";
import { users } from "$lib/database/schema/users";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import { mailService } from "$lib/services/mail";
import { tokenService } from "$lib/services/token";
import type {
  SignUpFinishRequest,
  SignUpFinishResponse,
} from "$lib/types/routes/auth/sign-up";
import type { UserConfirmEmailToken } from "$lib/types/user/tokens/confirm-email";

import { signUpSessions } from "./index";

const signUpFinishSchema = object({
  sessionId: idValidator,

  passwordClientHash: passwordHashValidator,

  captcha: captchaValidator,
});

const signUpFinishServer = createServer();

signUpFinishServer.post("/", async (c) => {
  const body = await c.req.json<SignUpFinishRequest>();
  const session = await signUpSessions.get(body.sessionId);

  const parsedBody = await signUpFinishSchema
    .superRefine(async (values, context) => {
      if (!session) {
        context.addIssue({
          code: ZodIssueCode.custom,
          message: ValidatorCode.NotFound,
          path: ["sessionId"],
        });
      }
    })
    .superRefine(async (values, context) => {
      if (session) {
        const result = await c.var.captcha.verify(
          values.captcha,
          session.captchaIdempotencyKey,
        );

        if (!result) {
          context.addIssue({
            code: ZodIssueCode.custom,
            message: ValidatorCode.Invalid,
            path: ["captcha"],
          });
        }
      }
    })
    .safeParseAsync(body);

  if (!parsedBody.success || !session) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error!.errors },
    });
  }

  const { data } = parsedBody;

  const passwordServerHash = await scrypt(
    data.passwordClientHash,
    session.serverSalt,
  );

  const [user] = await db
    .insert(users)
    .values({
      firstName: session.firstName,
      middleName: session.middleName,
      lastName: session.lastName,
      email: session.email,
      clientSalt: session.clientSalt,
      serverSalt: session.serverSalt,
      password: Buffer.from(passwordServerHash),
    })
    .returning({ id: users.id, role: users.role });

  await signUpSessions.delete(data.sessionId);

  const confirmEmailToken = await tokenService.create<UserConfirmEmailToken>(
    { userId: user.id },
    {
      purpose: TokenPurpose.ConfirmEmail,
      expiresAt: TokenService.getExpiresAt(TokenExpiresIn.OneDay),
    },
  );

  await mailService.send({
    to: {
      name: session.firstName,
      address: session.email,
    },
    template: MailTemplate.ConfirmEmail,
    data: {
      name: session.firstName,
      token: confirmEmailToken.token,
    },
  });

  await signIn(c, { userId: user.id, userRole: user.role });

  return response<SignUpFinishResponse>(c, {
    status: 201,
    content: { message: "User signed up" },
  });
});

export { signUpFinishSchema, signUpFinishServer };
