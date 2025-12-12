import { MailSender } from "../../enums/sender";
import { MailTemplateSender } from "../../enums/template/sender";
import type { MailTemplateStructure } from "../../types/template/structure";
import { approvalRequestHtml } from "./template";

const approvalRequestTemplate: MailTemplateStructure = {
  from: MailTemplateSender[MailSender.Admin],
  subject: "Ny bruger afventer godkendelse",
  html: approvalRequestHtml,
};

export type { ApprovalRequestData } from "./data";
export { approvalRequestTemplate };
