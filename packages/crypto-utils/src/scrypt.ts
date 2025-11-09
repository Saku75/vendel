async function scrypt(password: string, salt: string): Promise<Uint8Array> {
  try {
    const { scrypt } = await import("node:crypto");

    return await new Promise<Uint8Array>((resolve, reject) => {
      scrypt(
        password,
        salt,
        256,
        {
          N: 2 ** 16,
          r: 8,
          p: 1,
        },
        (err, derivedKey) => {
          if (err) {
            reject(err);
          } else {
            resolve(new Uint8Array(derivedKey));
          }
        },
      );
    });
  } catch {
    const { scryptAsync } = await import("@noble/hashes/scrypt.js");
    return await scryptAsync(password, salt, {
      N: 2 ** 16,
      r: 8,
      p: 1,
      dkLen: 256,
    });
  }
}

export { scrypt };
