import { gcm } from "@noble/ciphers/aes";
import { hmac } from "@noble/hashes/hmac";
import { sha3_512 } from "@noble/hashes/sha3";
import { bytesToUtf8, randomBytes, utf8ToBytes } from "@noble/hashes/utils";
import { base64urlnopad } from "@scure/base";

import { TokenExpiry } from "./enums/expiry";
import { TokenVersion } from "./enums/version";
import { TokenKeys } from "./types/keys";
import { TokenOptions } from "./types/options";
import { TokenPayload, TokenPayloadData } from "./types/payload";

class Token {
  private readonly keys: TokenKeys;
  private readonly defaultOptions?: TokenOptions;

  constructor(keys: TokenKeys, defaultOptions?: TokenOptions) {
    this.keys = keys;
    this.defaultOptions = defaultOptions;
  }

  public create<T extends TokenPayloadData = TokenPayloadData>(
    data: T,
    options?: TokenOptions,
  ): string {
    const version =
      options?.version || this.defaultOptions?.version || TokenVersion.V1;

    const issuer = options?.issuer || this.defaultOptions?.issuer;
    const purpose = options?.purpose || this.defaultOptions?.purpose;

    const issuedAt = Date.now();
    const expiresIn =
      options?.expiresIn ||
      this.defaultOptions?.expiresIn ||
      TokenExpiry.OneHour;

    const payloadBytes = this.encode({
      issuer,
      purpose,
      issuedAt,
      expiresAt: issuedAt + expiresIn * 1000,
      data,
    });

    const signature = this.sign(payloadBytes, version);

    const nonce = randomBytes(24);
    const encryptedPayload = this.encrypt(payloadBytes, nonce, version);

    return `${version}.${base64urlnopad.encode(nonce)}.${base64urlnopad.encode(encryptedPayload)}.${base64urlnopad.encode(signature)}`;
  }
  public read<T extends TokenPayloadData = TokenPayloadData>(
    token: string,
  ): { verified: boolean; payload: TokenPayload<T> } {
    if (!/^v\d(\.[A-Za-z0-9_-]+){3}$/.test(token))
      throw new Error(`Token: Unsupported token: ${token}`);

    const [version, nonce, encryptedPayload, signature] = token.split(".");

    const payloadBytes = this.decrypt(
      base64urlnopad.decode(encryptedPayload),
      base64urlnopad.decode(nonce),
      version as TokenVersion,
    );

    const verified = this.verify(
      payloadBytes,
      base64urlnopad.decode(signature),
      version as TokenVersion,
    );

    const payload = this.decode(payloadBytes) as TokenPayload<T>;

    return { verified, payload };
  }

  private encode(payload: TokenPayload): Uint8Array {
    const json = JSON.stringify({ payload });
    return utf8ToBytes(json);
  }
  private decode(payload: Uint8Array): TokenPayload {
    const json = bytesToUtf8(payload);
    return JSON.parse(json);
  }

  private sign(payload: Uint8Array, version: TokenVersion): Uint8Array {
    switch (version) {
      case TokenVersion.V1: {
        return hmac(sha3_512, this.keys.signing, payload);
      }
      default:
        throw new Error(`Token: Unsupported version: ${version}`);
    }
  }
  private verify(
    payload: Uint8Array,
    signature: Uint8Array,
    version: TokenVersion,
  ): boolean {
    switch (version) {
      case TokenVersion.V1: {
        return hmac(sha3_512, this.keys.signing, payload).every(
          (byte, index) => byte === signature[index],
        );
      }
      default:
        throw new Error(`Token: Unsupported version: ${version}`);
    }
  }

  private encrypt(
    payload: Uint8Array,
    nonce: Uint8Array,
    version: TokenVersion,
  ): Uint8Array {
    switch (version) {
      case TokenVersion.V1: {
        return gcm(this.keys.encryption, nonce).encrypt(payload);
      }
      default:
        throw new Error(`Token: Unsupported version: ${version}`);
    }
  }
  private decrypt(
    payload: Uint8Array,
    nonce: Uint8Array,
    version: TokenVersion,
  ): Uint8Array {
    switch (version) {
      case TokenVersion.V1: {
        return gcm(this.keys.encryption, nonce).decrypt(payload);
      }
      default:
        throw new Error(`Token: Unsupported version: ${version}`);
    }
  }
}

export { Token, TokenKeys };
