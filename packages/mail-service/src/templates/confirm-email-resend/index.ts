import { MailSender } from "../../enums/sender";
import { MailTemplateSender } from "../../enums/template/sender";
import type { MailTemplateStructure } from "../../types/template/structure";
import { confirmEmailResendHtml } from "./template";

const confirmEmailResendTemplate: MailTemplateStructure = {
  from: MailTemplateSender[MailSender.Accounts],
  subject: "Nyt link til bekræftelse af e-mail",
  html: confirmEmailResendHtml,
};

export type { ConfirmEmailResendData } from "./data";
export { confirmEmailResendTemplate };
