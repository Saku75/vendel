import { refreshTokenFamilies } from "$lib/server/database/schema/refresh-token-families";
import { refreshTokens } from "$lib/server/database/schema/refresh-tokens";
import { users } from "$lib/server/database/schema/users";

export type * from "./auth";
export type * from "./auth/session";
export type * from "./auth/token";
export type * from "./result";

export type RefreshFamilyToken = typeof refreshTokenFamilies.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type User = typeof users.$inferSelect;

export type {
  SignInFinishRequest,
  SignInSession,
  SignInStartRequest,
  SignInStartResponse,
} from "$routes/auth/sign-in";
export type {
  SignUpFinishRequest,
  SignUpSession,
  SignUpStartRequest,
  SignUpStartResponse,
} from "$routes/auth/sign-up";
export type { WhoAmIResponse } from "$routes/auth/who-am-i";
