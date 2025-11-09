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

function stringToBytes(input: string): Uint8Array {
  return new TextEncoder().encode(input);
}

function bytesToString(input: Uint8Array): string {
  return new TextDecoder().decode(input);
}

export {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToString,
  hexToBytes,
  stringToBytes,
};
