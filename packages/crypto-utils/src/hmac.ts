/**
 * Creates an HMAC signer/verifier with the given key and hash algorithm.
 * The key is imported once and cached for both signing and verification.
 *
 * @param key - The HMAC secret key
 * @param hash - The hash algorithm to use (SHA-1, SHA-256, SHA-384, SHA-512)
 */
function hmac(
  key: Uint8Array,
  hash: "SHA-256" | "SHA-384" | "SHA-512" = "SHA-256",
) {
  let cryptoKey: Awaited<ReturnType<typeof crypto.subtle.importKey>> | null =
    null;

  const importKey = async () => {
    if (!cryptoKey) {
      cryptoKey = await crypto.subtle.importKey(
        "raw",
        key,
        { name: "HMAC", hash },
        false,
        ["sign", "verify"],
      );
    }
    return cryptoKey;
  };

  return {
    async sign(data: Uint8Array): Promise<Uint8Array> {
      const key = await importKey();
      const signature = await crypto.subtle.sign("HMAC", key, data);
      return new Uint8Array(signature);
    },

    async verify(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
      const key = await importKey();
      return await crypto.subtle.verify("HMAC", key, signature, data);
    },
  };
}

export { hmac };
