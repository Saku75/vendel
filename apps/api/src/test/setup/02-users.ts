import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";

import { bytesToHex, randomBytes } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { users } from "$lib/server/database/schema/users";

import { TEST_USERS } from "../fixtures/users";

const database = drizzle(env.DB, {
  casing: "snake_case",
});

for (const user of Object.values(TEST_USERS)) {
  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const passwordServerHash = await scrypt(user.password, serverSalt);

  await database.insert(users).values({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: Buffer.from(passwordServerHash),
    clientSalt,
    serverSalt,
    role: user.role,
    emailVerified: true,
    approved: true,
  });
}
