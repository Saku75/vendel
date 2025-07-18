import type { CreateEmailOptions, CreateEmailResponse } from "resend";

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
  private readonly key: string;
  private readonly builtInPlaceholderValues: MailTemplateBuiltInPlaceholders;
  private readonly dev?: boolean;

  constructor(
    key: string,
    builtInPlaceholderValues: MailTemplateBuiltInPlaceholders,
    dev?: boolean,
  ) {
    this.key = key;
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

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${from.name} <${from.address}>`,
        to: `${to.name} <${to.address}>`,
        subject: subject,
        html: html,
        text: text,
      } satisfies CreateEmailOptions),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }

    return res.json() as Promise<CreateEmailResponse>;
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
    return html
      .replace(/<a.*?href="(.*?)".*?>(.*?)<\/a>/g, "$2 ($1)")
      .replace(/<.*?>/g, "");
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
