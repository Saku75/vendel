import { MailTemplate } from ".";
import { approvalRequestTemplate } from "../../templates/approval-request";
import { confirmEmailNewTemplate } from "../../templates/confirm-email-new";
import { confirmEmailResendTemplate } from "../../templates/confirm-email-resend";
import { welcomeTemplate } from "../../templates/welcome";
import type { MailTemplateStructure } from "../../types/template/structure";

const MailTemplateRegistry: Record<MailTemplate, MailTemplateStructure> = {
  [MailTemplate.ApprovalRequest]: approvalRequestTemplate,
  [MailTemplate.ConfirmEmailNew]: confirmEmailNewTemplate,
  [MailTemplate.ConfirmEmailResend]: confirmEmailResendTemplate,
  [MailTemplate.Welcome]: welcomeTemplate,
} as const;

export { MailTemplateRegistry };
