import { MailTemplate } from "../enums/template";
import { MailTemplatePlaceholder } from "./enums/placeholder";
import { MailTemplateSender } from "./enums/sender";
import type { MailTemplateStructure } from "./types/structure";

export const templateApprovalRequest: MailTemplateStructure = {
  from: MailTemplateSender[MailTemplate.ApprovalRequest],
  subject: "Ny bruger afventer godkendelse",
  html: `<html>
  <body>
    <p>Hej {{adminName}},</p>

    <p>En ny bruger har oprettet en konto på Vendel.dk og afventer godkendelse.</p>

    <p><strong>Brugeroplysninger:</strong></p>
    <ul>
      <li><strong>ID:</strong> {{userId}}</li>
      <li><strong>Navn:</strong> {{userName}}</li>
      <li><strong>E-mail:</strong> {{userEmail}}</li>
    </ul>

    <p>Log ind på Vendel.dk for at godkende eller afvise brugeren.</p>

    <p>Venlig hilsen<br />
    <a href="{{${MailTemplatePlaceholder.BaseUrl}}}">Vendel.dk</a></p>
  </body>
</html>`,
};
