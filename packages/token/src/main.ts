import { gcm } from "@noble/ciphers/aes";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils";
import { hmac } from "@noble/hashes/hmac";
import { sha3_512 } from "@noble/hashes/sha3";
import { randomBytes } from "@noble/hashes/utils";

import { TokenExpiry } from "./enums/expiry";
import { TokenPurpose } from "./enums/purpose";
import { TokenVersion } from "./enums/version";
import { TokenCreateOptions } from "./types/create-options";
import { TokenKeys } from "./types/keys";
import { TokenPayload, TokenPayloadData } from "./types/payload";

class Token {
  private readonly keys: TokenKeys;

  constructor(keys: TokenKeys) {
    this.keys = keys;
  }

  public create(data: TokenPayloadData, options: TokenCreateOptions): string {
    const version = options.version || TokenVersion.V1;

    const issuer = options.issuer || "none";
    const purpose = options.purpose || TokenPurpose.None;

    const issuedAt = Date.now();
    const expiresIn = options.expiresIn || TokenExpiry.OneHour;

    const payloadBytes = this.encode({
      issuer,
      issuedAt,
      expiresAt: issuedAt + expiresIn * 1000,
      purpose,
      data,
    });

    const signature = this.sign(payloadBytes, version);

    const nonce = randomBytes(24);
    const encryptedPayload = this.encrypt(payloadBytes, nonce, version);

    return `${version}.${bytesToHex(nonce)}.${bytesToHex(encryptedPayload)}.${bytesToHex(signature)}`;
  }
  public read<T extends TokenPayloadData = TokenPayloadData>(
    token: string,
  ): { verified: boolean; payload: TokenPayload<T> } {
    const [version, nonce, encryptedPayload, signature] = token.split(".");

    const payloadBytes = this.decrypt(
      hexToBytes(encryptedPayload),
      hexToBytes(nonce),
      version as TokenVersion,
    );

    const verified = this.verify(
      payloadBytes,
      hexToBytes(signature),
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

export {
  Token,
  TokenCreateOptions,
  TokenExpiry,
  TokenKeys,
  TokenPayload,
  TokenPayloadData,
  TokenPurpose,
  TokenVersion,
};
