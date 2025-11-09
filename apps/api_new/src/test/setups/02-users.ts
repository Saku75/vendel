import { bytesToHex, randomBytes } from "@noble/hashes/utils.js";

import { scrypt } from "@package/crypto-utils/scrypt";

import { users } from "$lib/database/schema/users";

import { testUsers } from "../fixtures/users";
import { testDatabase } from "../utils/database";

for (const user of Object.values(testUsers)) {
  const clientSalt = bytesToHex(randomBytes(32));
  const serverSalt = bytesToHex(randomBytes(32));

  const passwordClientHash = await scrypt(user.password, clientSalt);
  const passwordServerHash = await scrypt(passwordClientHash, serverSalt);

  await testDatabase.insert(users).values({
    ...user,
    password: Buffer.from(passwordServerHash),
    clientSalt,
    serverSalt,
  });
}
