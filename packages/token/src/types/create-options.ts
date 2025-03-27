import { TokenExpiry } from "../enums/expiry";
import { TokenPurpose } from "../enums/purpose";
import { TokenPayload, TokenVersion } from "../main";

type TokenCreateOptions = {
  version: TokenVersion;

  issuer: TokenPayload["issuer"];
  purpose: TokenPurpose | string;

  expiresIn: TokenExpiry | number;
};

export { TokenCreateOptions };
