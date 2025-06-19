import type { MailAddress } from "../../types/address";

type MailTemplateStructure = {
  from: MailAddress;
  subject: string;
  html: string;
};

export type { MailTemplateStructure };
