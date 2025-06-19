import { MailTemplate } from "../enums/template";
import { MailTemplatePlaceholder } from "./enums/placeholder";
import { MailTemplateSender } from "./enums/sender";
import { MailTemplateStructure } from "./types/structure";

export const templateConfirmEmail: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.ConfirmEmail],
  subject: "Bekræft din e-mail adresse",
  html: `<html>
  <body>
    <p>Hej {{name}},</p>

    <p>Du bedes bekræfte din e-mailadresse ved at klikke på linket nedenfor:<br />
    <a href="{{${MailTemplatePlaceholder.BaseURL}}}/auth/confirm-email?token={{token}}">Bekræft e-mail</a><br />
    Linket udløber om 24 timer. Du kan anmode om et nyt link ved at logge ind på din konto.</p>

    <p>Efter du har bekræftet din e-mailadresse, bliver din konto sendt til godkendelse.<br />
    Vi vil sende dig en e-mail, når din konto er blevet godkendt.</p>

    <p>Hvis du ikke har oprettet en konto på Vendel.dk, kan du ignorere denne e-mail.</p>

    <p>Med venlig hilsen,<br />
    <a href="{{${MailTemplatePlaceholder.BaseURL}}}">Vendel.dk</a></p>
  </body>
</html>`,
};
