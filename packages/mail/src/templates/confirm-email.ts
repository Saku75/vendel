import { MailTemplate } from "../enums/template";
import { MailTemplatePlaceholder } from "./enums/placeholder";
import { MailTemplateSender } from "./enums/sender";
import { MailTemplateStructure } from "./types/structure";

export const templateConfirmEmail: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.ConfirmEmail],
  subject: "Bekræft din e-mailadresse",
  html: `<html>
  <body>
    <p>Hej {{name}},</p>

    <p>Klik på linket herunder for at bekræfte din e-mailadresse:<br />
    <a href="{{${MailTemplatePlaceholder.BaseURL}}}/auth/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer. Du kan få et nyt ved at logge ind igen.</p>

    <p>Når din e-mail er bekræftet, sender vi din konto til godkendelse.<br />
    Du får besked, så snart den er klar.</p>

    <p>Hvis du ikke selv har oprettet en konto hos Vendel.dk, kan du bare ignorere denne mail.</p>

    <p>Venlig hilsen<br />
    <a href="{{${MailTemplatePlaceholder.BaseURL}}}">Vendel.dk</a></p>
  </body>
</html>`,
};
