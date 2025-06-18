import { TokenPayload, TokenPayloadData } from "./payload";

type TokenReadResponse<T extends TokenPayloadData = TokenPayloadData> = {
  valid: boolean;
  expired: boolean;
  payload: TokenPayload<T>;
};

export type { TokenReadResponse };
