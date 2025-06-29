import { TokenPayload, TokenPayloadData } from "./payload";

type TokenReadResponse<T extends TokenPayloadData | null = null> = {
  valid: boolean;
  expired: boolean;
  payload: TokenPayload<T>;
};

export type { TokenReadResponse };
