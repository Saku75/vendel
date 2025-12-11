import { MailTemplate } from "../enums/template";
import { MailTemplatePlaceholder } from "./enums/placeholder";
import { MailTemplateSender } from "./enums/sender";
import type { MailTemplateStructure } from "./types/structure";

export const templateConfirmEmailNew: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.ConfirmEmailNew],
  subject: "Bekræft din nye e-mailadresse",
  html: `<html>
  <body>
    <p>Hej {{name}},</p>

    <p>Du har tilføjet en ny e-mailadresse til din konto på Vendel.dk.</p>

    <p>Klik på linket herunder for at bekræfte denne e-mailadresse:<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer.</p>

    <p>Hvis du ikke selv har tilføjet denne e-mailadresse, kan du bare ignorere denne mail.</p>

    <p>Venlig hilsen<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}">Vendel.dk</a></p>
  </body>
</html>`,
};

export const templateConfirmEmailResend: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.ConfirmEmailResend],
  subject: "Nyt link til bekræftelse af e-mail",
  html: `<html>
  <body>
    <p>Hej {{name}},</p>

    <p>Du har anmodet om et nyt link til at bekræfte din e-mailadresse.</p>

    <p>Klik på linket herunder for at bekræfte din e-mailadresse:<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer.</p>

    <p>Hvis du ikke selv har anmodet om dette, kan du bare ignorere denne mail.</p>

    <p>Venlig hilsen<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}">Vendel.dk</a></p>
  </body>
</html>`,
};
