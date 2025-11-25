import type { z } from "zod";

import type { signUpFinishSchema } from "$routes/auth/sign-up/finish";
import type { signUpStartSchema } from "$routes/auth/sign-up/start";

type SignUpStartRequest = z.infer<typeof signUpStartSchema>;
type SignUpStartResponse = { sessionId: string; clientSalt: string };

type SignUpFinishRequest = z.infer<typeof signUpFinishSchema>;

export type { SignUpFinishRequest, SignUpStartRequest, SignUpStartResponse };
