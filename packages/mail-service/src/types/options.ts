import type { MailTemplate } from "../enums/template";
import type { MailAddress } from "./address";
import type { MailTemplateDataMap } from "./template/data-map";

type MailOptionsWithTemplateMail<T extends MailTemplate = MailTemplate> = {
  from?: MailAddress;
  to: MailAddress;
  template: T;
  data: MailTemplateDataMap[T];
};

type MailOptionsWithCustomMail = {
  from: MailAddress;
  to: MailAddress;
  subject: string;
  html: string;
  text: string;
};

type MailOptions<T extends MailTemplate = MailTemplate> =
  | MailOptionsWithTemplateMail<T>
  | MailOptionsWithCustomMail;

export type {
  MailOptions,
  MailOptionsWithCustomMail,
  MailOptionsWithTemplateMail,
};
