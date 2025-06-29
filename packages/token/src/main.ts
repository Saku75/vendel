import { gcm } from "@noble/ciphers/aes";
import { hmac } from "@noble/hashes/hmac";
import { sha3_512 } from "@noble/hashes/sha3";
import { bytesToUtf8, randomBytes, utf8ToBytes } from "@noble/hashes/utils";
import { base64urlnopad } from "@scure/base";

import { TokenExpiry } from "./enums/expiry";
import { TokenPurpose } from "./enums/purpose";
import { TokenVersion } from "./enums/version";
import { TokenKeys } from "./types/keys";
import { TokenOptions } from "./types/options";
import { TokenPayload, TokenPayloadData } from "./types/payload";
import { TokenReadResponse } from "./types/read";

class Token {
  private readonly keys: TokenKeys;
  private readonly defaultOptions?: TokenOptions;

  constructor(keys: TokenKeys, defaultOptions?: TokenOptions) {
    this.keys = keys;
    this.defaultOptions = defaultOptions;
  }

  public create<T extends TokenPayloadData = null>(
    data: T,
    options?: TokenOptions,
  ): string {
    const version =
      options?.version || this.defaultOptions?.version || TokenVersion.V1;

    const issuer = options?.issuer || this.defaultOptions?.issuer;
    const purpose = options?.purpose || this.defaultOptions?.purpose;

    const issuedAt = Date.now();
    const expiresIn = options?.expiresIn || TokenExpiry.OneHour;

    const payloadBytes = this.encode({
      issuer,
      purpose,
      issuedAt,
      expiresAt: options?.expiresAt || issuedAt + expiresIn * 1000,
      data,
    });

    const signature = this.sign(payloadBytes, version);

    const nonce = randomBytes(24);
    const encryptedPayload = this.encrypt(payloadBytes, nonce, version);

    return `${version}.${base64urlnopad.encode(nonce)}.${base64urlnopad.encode(encryptedPayload)}.${base64urlnopad.encode(signature)}`;
  }
  public read<T extends TokenPayloadData = null>(
    token: string,
  ): TokenReadResponse<T> {
    if (!/^v\d(\.[A-Za-z0-9_-]+){3}$/.test(token))
      throw new Error(`Token: Malformed token: ${token}`);

    const [version, nonce, encryptedPayload, signature] = token.split(".");

    const payloadBytes = this.decrypt(
      base64urlnopad.decode(encryptedPayload),
      base64urlnopad.decode(nonce),
      version as TokenVersion,
    );

    const valid = this.verify(
      payloadBytes,
      base64urlnopad.decode(signature),
      version as TokenVersion,
    );

    const payload = this.decode(payloadBytes) as TokenPayload<T>;

    const expired = payload.expiresAt < Date.now();

    return { valid, expired, payload };
  }

  private encode<T extends TokenPayloadData>(
    payload: TokenPayload<T>,
  ): Uint8Array {
    const json = JSON.stringify({ ...payload });
    return utf8ToBytes(json);
  }
  private decode<T extends TokenPayloadData>(
    payload: Uint8Array,
  ): TokenPayload<T> {
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

export {
  Token,
  TokenExpiry,
  TokenKeys,
  TokenOptions,
  TokenPayload,
  TokenPayloadData,
  TokenPurpose,
  TokenReadResponse,
  TokenVersion,
};
