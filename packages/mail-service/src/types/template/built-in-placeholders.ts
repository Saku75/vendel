import type { MailTemplatePlaceholder } from "../../enums/template/placeholder";

type MailTemplateBuiltInPlaceholders = {
  [MailTemplatePlaceholder.BaseUrl]: string;
};

export type { MailTemplateBuiltInPlaceholders };
