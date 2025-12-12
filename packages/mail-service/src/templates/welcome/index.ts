import { MailSender } from "../../enums/sender";
import { MailTemplateSender } from "../../enums/template/sender";
import type { MailTemplateStructure } from "../../types/template/structure";
import { welcomeHtml } from "./template";

const welcomeTemplate: MailTemplateStructure = {
  from: MailTemplateSender[MailSender.Contact],
  subject: "Velkommen til Vendel.dk",
  html: welcomeHtml,
};

export type { WelcomeData } from "./data";
export { welcomeTemplate };
