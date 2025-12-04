import { scryptAsync } from "@noble/hashes/scrypt.js";

async function scrypt(
  password: string | Uint8Array,
  salt: string,
): Promise<Uint8Array> {
  return await scryptAsync(password, salt, {
    N: 2 ** 16,
    r: 8,
    p: 1,
    dkLen: 256,
  });
}

export { scrypt };
