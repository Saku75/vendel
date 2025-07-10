import { scryptAsync } from "@noble/hashes/scrypt";
import { KDFInput } from "@noble/hashes/utils";

async function scrypt(password: KDFInput, salt: KDFInput) {
  return await scryptAsync(password, salt, {
    N: 2 ** 17,
    r: 8,
    p: 1,
    dkLen: 256,
  });
}

export { scrypt };
