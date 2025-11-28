import { z } from "zod";

import { confirmEmailSchema } from "$routes/user/email/confirm";

type ConfirmEmailRequest = z.infer<typeof confirmEmailSchema>;
type ConfirmEmailResponse = undefined;

export type { ConfirmEmailRequest, ConfirmEmailResponse };
