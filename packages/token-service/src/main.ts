import {
  base64ToBytes,
  bytesToBase64,
  bytesToUtf8,
  randomBytes,
  utf8ToBytes,
} from "@package/crypto-utils/bytes";
import { gcm } from "@package/crypto-utils/gcm";
import { hmac } from "@package/crypto-utils/hmac";

import { TokenExpiresIn } from "./enums/expires-in";
import { TokenPurpose } from "./enums/purpose";
import { TokenVersion } from "./enums/version";
import type { TokenServiceCreateResult } from "./types/service/create/result";
import type { TokenServiceKeys } from "./types/service/keys";
import type {
  TokenServiceReadMetadataResult,
  TokenServiceReadResult,
} from "./types/service/read/result";
import type { TokenData } from "./types/token/data";
import type { TokenMetadata } from "./types/token/metadata";

class TokenService {
  private readonly keys: TokenServiceKeys;
  private readonly issuer?: string;
  private readonly audience?: string;

  constructor(
    keys: TokenServiceKeys,
    options?: Pick<TokenMetadata, "issuer" | "audience">,
  ) {
    this.keys = keys;
    this.issuer = options?.issuer;
    this.audience = options?.audience;
  }

  public async create<TData extends TokenData = null>(
    data: TData,
    options?: Partial<Pick<TokenMetadata, "purpose" | "expiresAt">>,
  ): Promise<TokenServiceCreateResult> {
    const version = TokenVersion.V1;

    const nonce = randomBytes(12);
    const now = TokenService.now();

    const metadata: TokenMetadata = {
      issuer: this.issuer,
      audience: this.audience,
      purpose: options?.purpose,
      issuedAt: now,
      expiresAt:
        options?.expiresAt ??
        now + TokenService.convertSeconds(TokenExpiresIn.OneHour),
      nonce: bytesToBase64(nonce),
    };

    const dataBytes = utf8ToBytes(JSON.stringify(data));
    const encryptedData = await this.encrypt(version, nonce, dataBytes);

    const metadataPart = bytesToBase64(utf8ToBytes(JSON.stringify(metadata)));
    const dataPart = bytesToBase64(encryptedData);

    const toSign = `${version}.${metadataPart}.${dataPart}`;
    const signatureBytes = await this.sign(version, utf8ToBytes(toSign));
    const signaturePart = bytesToBase64(signatureBytes);

    const token = `${version}.${metadataPart}.${dataPart}.${signaturePart}`;

    return {
      token,
    };
  }

  public read<TData extends TokenData = null>(
    token: string,
  ): Promise<TokenServiceReadResult<TData>>;
  public read(
    token: string,
    options: { metadataOnly: true },
  ): Promise<TokenServiceReadMetadataResult>;
  public async read<TData extends TokenData = null>(
    token: string,
    options?: { metadataOnly?: boolean },
  ): Promise<TokenServiceReadResult<TData> | TokenServiceReadMetadataResult> {
    const parts = token.split(".");
    if (parts.length !== 4) {
      throw new Error("TokenService: Invalid token format");
    }

    const [versionStr, metadataPart, dataPart, signaturePart] = parts;

    const version = versionStr as TokenVersion;
    if (!Object.values(TokenVersion).includes(version)) {
      throw new Error(`TokenService: Unsupported version: ${version}`);
    }

    const toVerify = `${versionStr}.${metadataPart}.${dataPart}`;
    const signatureBytes = base64ToBytes(signaturePart);
    const verified = await this.verify(
      version,
      utf8ToBytes(toVerify),
      signatureBytes,
    );

    const metadataBytes = base64ToBytes(metadataPart);
    const metadataJson = bytesToUtf8(metadataBytes);
    const metadata = JSON.parse(metadataJson) as TokenMetadata;

    const now = TokenService.now();
    const expired = now > metadata.expiresAt;

    if (options?.metadataOnly) {
      return {
        verified,
        expired,
        metadata,
      };
    }

    const encryptedData = base64ToBytes(dataPart);
    const nonce = base64ToBytes(metadata.nonce);
    const decryptedBytes = await this.decrypt(encryptedData, nonce, version);
    const decryptedJson = bytesToUtf8(decryptedBytes);
    const data = JSON.parse(decryptedJson) as TData;

    const tokenData = {
      version,
      metadata,
      data,
      signature: signaturePart,
    };

    return {
      verified,
      expired,
      token: tokenData,
    };
  }

  private sign(version: TokenVersion, data: Uint8Array): Promise<Uint8Array> {
    switch (version) {
      case TokenVersion.V1: {
        return hmac(this.keys.signing, "SHA-256").sign(data);
      }
      default:
        throw new Error(`TokenService: Unsupported version: ${version}`);
    }
  }
  private verify(
    version: TokenVersion,
    data: Uint8Array,
    signature: Uint8Array,
  ): Promise<boolean> {
    switch (version) {
      case TokenVersion.V1: {
        return hmac(this.keys.signing, "SHA-256").verify(data, signature);
      }
      default:
        throw new Error(`TokenService: Unsupported version: ${version}`);
    }
  }

  private async encrypt(
    version: TokenVersion,
    nonce: Uint8Array,
    data: Uint8Array,
  ): Promise<Uint8Array> {
    switch (version) {
      case TokenVersion.V1: {
        return await gcm(this.keys.encryption, nonce).encrypt(data);
      }
      default:
        throw new Error(`TokenService: Unsupported version: ${version}`);
    }
  }
  private async decrypt(
    payload: Uint8Array,
    nonce: Uint8Array,
    version: TokenVersion,
  ): Promise<Uint8Array> {
    switch (version) {
      case TokenVersion.V1: {
        return gcm(this.keys.encryption, nonce).decrypt(payload);
      }
      default:
        throw new Error(`TokenService: Unsupported version: ${version}`);
    }
  }

  static now(): number {
    return Date.now();
  }

  static convertSeconds(seconds: number): number {
    return seconds * 1000;
  }

  static getExpiresAt(expiresIn: number): number {
    return this.now() + this.convertSeconds(expiresIn);
  }
}

export { TokenExpiresIn, TokenPurpose, TokenService, TokenVersion };
export type {
  TokenData,
  TokenMetadata,
  TokenServiceCreateResult,
  TokenServiceKeys,
  TokenServiceReadMetadataResult,
  TokenServiceReadResult,
};
