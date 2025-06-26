import { Resend } from "resend";

import { MailTemplate } from "./enums/template";
import { templateConfirmEmail } from "./templates/confirm-email";
import { MailTemplatePlaceholder } from "./templates/enums/placeholder";
import { MailTemplateBuiltInPlaceholders } from "./templates/types/built-in-placeholders";
import { MailTemplateStructure } from "./templates/types/structure";
import { MailAddress } from "./types/address";
import {
  MailOptions,
  MailOptionsWithCustomMail,
  MailOptionsWithTemplateMail,
} from "./types/options";

class Mail {
  private readonly resend: Resend;
  private readonly builtInPlaceholderValues: MailTemplateBuiltInPlaceholders;
  private readonly dev?: boolean;

  constructor(
    key: string,
    builtInPlaceholderValues: MailTemplateBuiltInPlaceholders,
    dev?: boolean,
  ) {
    this.resend = new Resend(key);
    this.builtInPlaceholderValues = builtInPlaceholderValues;
    this.dev = dev;
  }

  public async send(mail: MailOptions) {
    if ("template" in mail) {
      return this.handleTemplateMail(mail);
    }

    return this.handleCustomMail(mail);
  }

  private async _send(
    from: MailAddress,
    to: MailAddress,
    subject: string,
    html: string,
    text: string,
  ) {
    if (this.dev) {
      console.log(
        "Email sent:",
        JSON.stringify(
          {
            from,
            to,
            subject,
            html,
            text,
          },
          null,
          2,
        ),
      );

      return;
    }

    return await this.resend.emails.send({
      from: `${from.name} <${from.address}>`,
      to: `${to.name} <${to.address}>`,
      subject,
      html,
      text,
    });
  }

  private async handleTemplateMail(mail: MailOptionsWithTemplateMail) {
    const { from, to, template, data } = mail;

    let templateContent: MailTemplateStructure;

    switch (template) {
      case MailTemplate.ConfirmEmail:
        templateContent = templateConfirmEmail;
        break;
      default:
        throw new Error(`Mail: Unknown template: ${template}`);
    }

    const html = this.replacePlaceholders(templateContent.html, data);
    const text = this.htmlToText(html);

    return await this._send(
      from ? from : templateContent.from,
      to,
      templateContent.subject,
      html,
      text,
    );
  }

  private async handleCustomMail(mail: MailOptionsWithCustomMail) {
    const { from, to, subject, html, text } = mail;

    return await this._send(from, to, subject, html, text);
  }

  private htmlToText(html: string) {
    return (
      html
        // Convert anchor tags to plain text
        .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, "$2 ($1)")
        // Remove all other tags
        .replace(/<.*?>/g, "")
    );
  }

  private replacePlaceholders(
    html: string,
    data: Record<string, string | number | boolean>,
  ) {
    const builtInPlaceholders = html.replace(
      this.constructPlaceholderRegExp(MailTemplatePlaceholder.BaseURL),
      this.builtInPlaceholderValues.baseURL,
    );

    const dataPlaceholders = Object.entries(data).reduce(
      (acc, [key, value]) => {
        return acc.replace(
          this.constructPlaceholderRegExp(key),
          value.toString(),
        );
      },
      builtInPlaceholders,
    );

    const missedPlaceholders = dataPlaceholders.match(/{{.*?}}/);

    if (missedPlaceholders?.length) {
      throw new Error(
        `Mail: Missing data for template: ${missedPlaceholders.join(", ")}`,
      );
    }

    return dataPlaceholders;
  }

  private constructPlaceholderRegExp(placeholder: string) {
    return new RegExp(`{{${placeholder}}}`, "g");
  }
}

export { Mail, MailTemplate };
