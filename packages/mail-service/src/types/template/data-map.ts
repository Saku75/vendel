import type { MailTemplate } from "../../enums/template";
import type { ApprovalRequestData } from "../../templates/approval-request";
import type { ConfirmEmailNewData } from "../../templates/confirm-email-new";
import type { ConfirmEmailResendData } from "../../templates/confirm-email-resend";
import type { WelcomeData } from "../../templates/welcome";

type MailTemplateDataMap = {
  [MailTemplate.Welcome]: WelcomeData;
  [MailTemplate.ConfirmEmailNew]: ConfirmEmailNewData;
  [MailTemplate.ConfirmEmailResend]: ConfirmEmailResendData;
  [MailTemplate.ApprovalRequest]: ApprovalRequestData;
};

export type { MailTemplateDataMap };
