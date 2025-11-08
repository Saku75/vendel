import type { TokenVersion } from "../../enums/version";
import type { TokenData } from "./data";
import type { TokenMetadata } from "./metadata";

type Token<TData extends TokenData = null> = {
  version: TokenVersion;
  metadata: TokenMetadata;
  data: TData;
  signature: string;
};

export type { Token, TokenData, TokenMetadata };
