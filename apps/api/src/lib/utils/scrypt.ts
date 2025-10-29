import { scryptAsync } from "@noble/hashes/scrypt.js";

async function scrypt(password: string, salt: string) {
  return await scryptAsync(password, salt, {
    N: 2 ** 17,
    r: 8,
    p: 1,
    dkLen: 256,
  });
}

export { scrypt };
