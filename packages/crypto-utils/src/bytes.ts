function bytesToHex(input: Uint8Array): string {
  return input.toHex();
}

function hexToBytes(input: string): Uint8Array {
  return Uint8Array.fromHex(input);
}

function bytesToBase64(input: Uint8Array): string {
  return input.toBase64({ alphabet: "base64url", omitPadding: true });
}

function base64ToBytes(input: string): Uint8Array {
  return Uint8Array.fromBase64(input, { alphabet: "base64url" });
}

function utf8ToBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function bytesToUtf8(input: Uint8Array): string {
  return new TextDecoder().decode(input);
}

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

export {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  randomBytes,
  utf8ToBytes,
};
