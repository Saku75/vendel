/**
 * Creates an AES-GCM cipher with the given key and nonce.
 * The key is imported once and cached for both encryption and decryption.
 *
 * @param key - The encryption key (16, 24, or 32 bytes for AES-128/192/256)
 * @param nonce - The initialization vector (typically 12 bytes)
 * @param tagLength - Authentication tag length in bits (default: 128)
 */
function gcm(key: Uint8Array, nonce: Uint8Array, tagLength: number = 128) {
  let cryptoKey: Awaited<ReturnType<typeof crypto.subtle.importKey>> | null =
    null;

  const importKey = async () => {
    if (!cryptoKey) {
      cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"],
      );
    }
    return cryptoKey;
  };

  return {
    async encrypt(data: Uint8Array): Promise<Uint8Array> {
      const key = await importKey();
      const encrypted = await crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: nonce,
          tagLength,
        },
        key,
        data,
      );
      return new Uint8Array(encrypted);
    },

    async decrypt(data: Uint8Array): Promise<Uint8Array> {
      const key = await importKey();
      const decrypted = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: nonce,
          tagLength,
        },
        key,
        data,
      );
      return new Uint8Array(decrypted);
    },
  };
}

export { gcm };
