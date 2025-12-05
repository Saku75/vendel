import type { z } from "zod/mini";

import type { confirmEmailSchema } from "$routes/user/email/confirm";

type ConfirmEmailRequest = z.infer<typeof confirmEmailSchema>;
type ConfirmEmailResponse = undefined;

export type { ConfirmEmailRequest, ConfirmEmailResponse };
