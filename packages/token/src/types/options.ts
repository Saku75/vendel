import { TokenExpiry } from "../enums/expiry";
import { TokenPurpose } from "../enums/purpose";
import { TokenVersion } from "../enums/version";
import { TokenPayload } from "./payload";

type TokenOptionsWithExpiresIn = Partial<{
  version: TokenVersion;

  issuer: TokenPayload["issuer"];
  purpose: TokenPurpose | string;

  expiresIn: TokenExpiry | number;
  expiresAt: never;
}>;

type TokenOptionsWithExpiresAt = Partial<{
  version: TokenVersion;

  issuer: TokenPayload["issuer"];
  purpose: TokenPurpose | string;

  expiresIn: never;
  expiresAt: number;
}>;

type TokenOptions = TokenOptionsWithExpiresIn | TokenOptionsWithExpiresAt;

export { TokenOptions };
