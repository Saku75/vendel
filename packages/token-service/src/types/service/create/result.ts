import type { TokenMetadata } from "../../token/metadata";

type TokenServiceCreateResult = {
  id: TokenMetadata["id"];
  token: string;
};

export type { TokenServiceCreateResult };
