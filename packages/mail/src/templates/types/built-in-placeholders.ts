import { MailTemplatePlaceholder } from "../enums/placeholder";

type MailTemplateBuiltInPlaceholders = {
  [MailTemplatePlaceholder.BaseURL]: string;
};

export type { MailTemplateBuiltInPlaceholders };
