import { bytesToHex, randomBytes } from "@package/crypto-utils/bytes";
import { scrypt } from "@package/crypto-utils/scrypt";

import { userEmails } from "$lib/database/schema/user-emails";
import { userPasswords } from "$lib/database/schema/user-passwords";
import { users } from "$lib/database/schema/users";

import { testUsers } from "../fixtures/users";
import { testDatabase } from "../utils/database";

for (const user of Object.values(testUsers)) {
  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const passwordClientHash = await scrypt(user.password, clientSalt);
  const passwordServerHash = await scrypt(passwordClientHash, serverSalt);

  await testDatabase.insert(users).values({
    id: user.id,
    firstName: user.firstName,
    middleName: user.middleName,
    lastName: user.lastName,
    role: user.role,
    approved: user.approved,
    approvedBy: user.approvedBy,
  });

  for (const email of user.emails) {
    await testDatabase.insert(userEmails).values({
      userId: user.id,
      email: email.email,
      verified: email.verified,
      primary: email.primary,
    });
  }

  await testDatabase.insert(userPasswords).values({
    userId: user.id,
    passwordHash: Buffer.from(passwordServerHash),
    clientSalt,
    serverSalt,
  });
}
