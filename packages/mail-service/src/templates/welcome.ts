import { MailTemplate } from "../enums/template";
import { MailTemplatePlaceholder } from "./enums/placeholder";
import { MailTemplateSender } from "./enums/sender";
import type { MailTemplateStructure } from "./types/structure";

export const templateWelcome: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.Welcome],
  subject: "Velkommen til Vendel.dk",
  html: `<html>
  <body>
    <p>Hej {{name}},</p>

    <p>Velkommen til Vendel.dk! Vi er glade for at have dig med.</p>

    <p>Klik på linket herunder for at bekræfte din e-mailadresse:<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer. Du kan få et nyt ved at logge ind igen.</p>

    <p>Når din e-mail er bekræftet, vil en administrator gennemgå din konto.<br />
    Du modtager en e-mail, så snart din konto er godkendt.</p>

    <p>Hvis du ikke selv har oprettet en konto hos Vendel.dk, kan du bare ignorere denne mail.</p>

    <p>Venlig hilsen<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}">Vendel.dk</a></p>
  </body>
</html>`,
};
