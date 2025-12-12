import { baseLayout } from "../../layouts/base";

const approvalRequestHtml = baseLayout(`<p>Hej {{adminName}},</p>

    <p>En ny bruger har oprettet en konto på Vendel.dk og afventer godkendelse.</p>

    <p><strong>Brugeroplysninger:</strong></p>
    <ul>
      <li><strong>ID:</strong> {{userId}}</li>
      <li><strong>Navn:</strong> {{userName}}</li>
      <li><strong>E-mail:</strong> {{userEmail}}</li>
    </ul>

    <p>Log ind på Vendel.dk for at godkende eller afvise brugeren.</p>`);

export { approvalRequestHtml };
