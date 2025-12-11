import { waitUntil } from "cloudflare:workers";
import { inArray } from "drizzle-orm";
import { object } from "zod/mini";

import { base64ToBytes } from "@package/crypto-utils/bytes";
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
import { userEmails } from "$lib/database/schema/user-emails";
import { userPasswords } from "$lib/database/schema/user-passwords";
import { users } from "$lib/database/schema/users";
import { AuthRole } from "$lib/enums/auth/role";
import { createServer } from "$lib/server";
import { response } from "$lib/server/response";
import { mailService } from "$lib/services/mail";
import { tokenService } from "$lib/services/token";
import type { SignUpFinishRequest, SignUpFinishResponse } from "$lib/types";
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

  const parsedBody = signUpFinishSchema.safeParse(body);
  if (!parsedBody.success) {
    return response(c, {
      status: 400,
      content: { errors: parsedBody.error.issues },
    });
  }

  const { data } = parsedBody;

  const session = await signUpSessions.get(data.sessionId);
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

  const user = await db
    .insert(users)
    .values({
      firstName: session.firstName,
      middleName: session.middleName,
      lastName: session.lastName,
    })
    .returning({ id: users.id, role: users.role })
    .get();

  await Promise.all([
    db.insert(userEmails).values({
      userId: user.id,
      email: session.email,
      primary: true,
    }),
    db.insert(userPasswords).values({
      userId: user.id,
      passwordHash: Buffer.from(passwordServerHash),
      clientSalt: session.clientSalt,
      serverSalt: session.serverSalt,
    }),
    signUpSessions.delete(data.sessionId),
  ]);

  const confirmEmailToken = await tokenService.create<UserConfirmEmailToken>(
    { userId: user.id, email: session.email },
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
    template: MailTemplate.Welcome,
    data: {
      name: session.firstName,
      token: confirmEmailToken.token,
    },
  });

  const newUserName = [session.firstName, session.middleName, session.lastName]
    .filter(Boolean)
    .join(" ");

  waitUntil(
    sendApprovalRequestEmails({
      userId: user.id,
      userName: newUserName,
      userEmail: session.email,
    }),
  );

  await signIn(c, { userId: user.id, userRole: user.role });

  return response<SignUpFinishResponse>(c, {
    status: 201,
    content: { message: "User signed up" },
  });
});

async function sendApprovalRequestEmails(newUser: {
  userId: string;
  userName: string;
  userEmail: string;
}) {
  const adminUsers = await db
    .select({ id: users.id, firstName: users.firstName })
    .from(users)
    .where(inArray(users.role, [AuthRole.Admin, AuthRole.SuperAdmin]));

  const adminEmails = await db
    .select({
      userId: userEmails.userId,
      email: userEmails.email,
    })
    .from(userEmails)
    .where(
      inArray(
        userEmails.userId,
        adminUsers.map((a) => a.id),
      ),
    );

  const emailPromises = adminUsers
    .map((admin) => {
      const adminEmail = adminEmails.find((e) => e.userId === admin.id);
      if (!adminEmail) return null;

      return mailService.send({
        to: {
          name: admin.firstName,
          address: adminEmail.email,
        },
        template: MailTemplate.ApprovalRequest,
        data: {
          adminName: admin.firstName,
          userId: newUser.userId,
          userName: newUser.userName,
          userEmail: newUser.userEmail,
        },
      });
    })
    .filter((p) => p !== null);

  await Promise.all(emailPromises);
}

export { signUpFinishSchema, signUpFinishServer };
