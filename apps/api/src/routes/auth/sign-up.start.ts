import { bytesToHex, randomBytes } from "@noble/hashes/utils";
import { createId } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { validators } from "@repo/validators";

import { users } from "$lib/database/schema/users";
import { app } from "$lib/utils/app";
import { extractIssues } from "$lib/validation/utils";

import { SignUpSession, SignUpStartResponse } from "./sign-up";

const signUpStartSchema = z.object({
  firstName: validators.name.first,
  middleName: validators.name.middle,
  lastName: validators.name.last,

  email: validators.email,
});

const signUpStartRoute = app().post("/", async (c) => {
  const body = await c.req.json<z.infer<typeof signUpStartSchema>>();

  const [parsedBody, emailCheck] = await Promise.all([
    signUpStartSchema.safeParseAsync(body),
    c.var.database
      .select({ email: users.email })
      .from(users)
      .where(eq(users.email, body.email)),
  ]);

  if (!parsedBody.success || emailCheck.length) {
    let issues: Record<string, string> = {};

    if (!parsedBody.success)
      issues = { ...issues, ...extractIssues(parsedBody.error) };
    if (emailCheck.length)
      issues = {
        ...issues,
        email: "Der findes allerede en konto med denne e-mail.",
      };

    return c.json({ status: 400, errors: issues }, 400);
  }

  const { data } = parsedBody;

  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const user = await c.var.database
    .insert(users)
    .values({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      clientSalt: clientSalt,
      serverSalt: serverSalt,
    })
    .returning({ id: users.id });
  const { id: userId } = user[0];

  const sessionId = createId();

  await c.env.KV.put(
    `auth:sign-up:session:${sessionId}`,
    JSON.stringify({
      userId,
      serverSalt,
    } satisfies SignUpSession),
    { expirationTtl: 60 },
  );

  return c.json(
    { status: 201, data: { sessionId, clientSalt } } satisfies {
      status: number;
      data: SignUpStartResponse;
    },
    201,
  );
});

export { signUpStartRoute, signUpStartSchema };
