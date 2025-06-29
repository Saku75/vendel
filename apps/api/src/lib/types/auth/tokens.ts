import { TokenReadResponse } from "@package/token";

type RefreshTokenData = {
  refreshTokenId: string;
};

type AuthTokenData = {
  refreshTokenId: string;
  authTokenId: string;
};

interface AuthTokens {
  refresh?: TokenReadResponse<RefreshTokenData>;
  auth: TokenReadResponse<AuthTokenData>;
}

export type { AuthTokenData, AuthTokens, RefreshTokenData };
