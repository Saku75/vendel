import type { MailTemplate } from "../enums/template";
import type { MailAddress } from "./address";

type MailOptionsWithTemplateMail = {
  from?: MailAddress;
  to: MailAddress;
  template: MailTemplate;
  data: Record<string, string | number | boolean>;
};

type MailOptionsWithCustomMail = {
  from: MailAddress;
  to: MailAddress;
  subject: string;
  html: string;
  text: string;
};

type MailOptions = MailOptionsWithTemplateMail | MailOptionsWithCustomMail;

export type {
  MailOptions,
  MailOptionsWithCustomMail,
  MailOptionsWithTemplateMail,
};
