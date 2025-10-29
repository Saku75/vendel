import { scryptAsync } from "@noble/hashes/scrypt.js";
import { KDFInput } from "@noble/hashes/utils.js";

async function scrypt(password: KDFInput, salt: KDFInput) {
  return await scryptAsync(password, salt, {
    N: 2 ** 17,
    r: 8,
    p: 1,
    dkLen: 256,
  });
}

export { scrypt };
