import type { TokenMetadata } from "../../token/metadata";
import type { Token, TokenData } from "../../token/token";

type TokenServiceReadResult<TData extends TokenData = null> = {
  verified: boolean;
  expired: boolean;
  token: Token<TData>;
};

type TokenServiceReadMetadataResult = {
  verified: boolean;
  expired: boolean;
  metadata: TokenMetadata;
};

export type { TokenServiceReadMetadataResult, TokenServiceReadResult };
