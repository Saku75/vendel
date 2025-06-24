import { scryptAsync } from "@noble/hashes/scrypt";
import { base64urlnopad } from "@scure/base";

(async function name() {
  const password = process.argv[2];
  const salt = process.argv[3];

  const passwordHash = await scryptAsync(password, salt, {
    N: 2 ** 17,
    r: 8,
    p: 1,
    dkLen: 256,
  });

  console.log("Password hash: ", base64urlnopad.encode(passwordHash));
})();
