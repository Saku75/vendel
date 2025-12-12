import type { MailAddress } from "../address";

type MailTemplateStructure = {
  from: MailAddress;
  subject: string;
  html: string;
};

export type { MailTemplateStructure };
