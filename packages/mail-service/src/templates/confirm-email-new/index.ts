import { MailSender } from "../../enums/sender";
import { MailTemplateSender } from "../../enums/template/sender";
import type { MailTemplateStructure } from "../../types/template/structure";
import { confirmEmailNewHtml } from "./template";

const confirmEmailNewTemplate: MailTemplateStructure = {
  from: MailTemplateSender[MailSender.Accounts],
  subject: "Bekræft din nye e-mailadresse",
  html: confirmEmailNewHtml,
};

export type { ConfirmEmailNewData } from "./data";
export { confirmEmailNewTemplate };
