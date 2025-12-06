import type { MailTemplatePlaceholder } from "../enums/placeholder";

type MailTemplateBuiltInPlaceholders = {
  [MailTemplatePlaceholder.BaseUrl]: string;
};

export type { MailTemplateBuiltInPlaceholders };
