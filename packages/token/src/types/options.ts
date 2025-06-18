import { TokenExpiry } from "../enums/expiry";
import { TokenPurpose } from "../enums/purpose";
import { TokenVersion } from "../enums/version";
import { TokenPayload } from "./payload";

type TokenOptions = Partial<{
  version: TokenVersion;

  issuer: TokenPayload["issuer"];
  purpose: TokenPurpose | string;

  expiresIn: TokenExpiry | number;
}>;

export { TokenOptions };
