import type { CreateEmailOptions, CreateEmailResponse } from "resend";

import { MailTemplate } from "./enums/template";
import { MailTemplatePlaceholder } from "./enums/template/placeholder";
import { MailTemplateRegistry } from "./enums/template/registry";
import type { MailAddress } from "./types/address";
import type {
  MailOptions,
  MailOptionsWithCustomMail,
  MailOptionsWithTemplateMail,
} from "./types/options";
import type { MailTemplateBuiltInPlaceholders } from "./types/template/built-in-placeholders";

class MailService {
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

  public async send<T extends MailTemplate>(mail: MailOptions<T>) {
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
      } satisfies CreateEmailOptions),
    });

    if (!res.ok) {
      throw new Error(`Failed to send email: ${await res.text()}`);
    }

    return res.json() as Promise<CreateEmailResponse>;
  }

  private async handleTemplateMail(mail: MailOptionsWithTemplateMail) {
    const { from, to, template, data } = mail;

    const templateContent = MailTemplateRegistry[template];

    if (!templateContent) {
      throw new Error(`Mail: Template "${template}" not found in registry`);
    }

    const html = this.replacePlaceholders(templateContent.html, data);

    return await this._send(
      from ? from : templateContent.from,
      to,
      templateContent.subject,
      html,
    );
  }

  private async handleCustomMail(mail: MailOptionsWithCustomMail) {
    const { from, to, subject, html } = mail;

    return await this._send(from, to, subject, html);
  }

  private replacePlaceholders(
    html: string,
    data: Record<string, string | number | boolean>,
  ) {
    const builtInPlaceholders = html.replace(
      this.constructPlaceholderRegExp(MailTemplatePlaceholder.BaseUrl),
      this.builtInPlaceholderValues.baseUrl,
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

export { MailService, MailTemplate };
