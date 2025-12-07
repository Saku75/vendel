/**
 * Type declarations for Uint8Array hex and base64 methods (TC39 Stage 4 proposal)
 * @see https://github.com/tc39/proposal-arraybuffer-base64
 */

interface Uint8Array {
  /**
   * Converts the Uint8Array to a hexadecimal string.
   */
  toHex(): string;

  /**
   * Converts the Uint8Array to a base64 string.
   */
  toBase64(options?: {
    alphabet?: "base64" | "base64url";
    omitPadding?: boolean;
  }): string;
}

interface Uint8ArrayConstructor {
  /**
   * Creates a Uint8Array from a hexadecimal string.
   */
  fromHex(hex: string): Uint8Array;

  /**
   * Creates a Uint8Array from a base64 string.
   */
  fromBase64(
    base64: string,
    options?: { alphabet?: "base64" | "base64url" },
  ): Uint8Array;
}
