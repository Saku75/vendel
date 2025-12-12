import { baseLayout } from "../../layouts/base";

const confirmEmailResendHtml = baseLayout(`<p>Hej {{name}},</p>

    <p>Du har anmodet om et nyt link til at bekræfte din e-mailadresse.</p>

    <p>Klik på linket herunder for at bekræfte din e-mailadresse:<br />
    <a href="{{baseUrl}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer.</p>

    <p>Hvis du ikke selv har anmodet om dette, kan du bare ignorere denne mail.</p>`);

export { confirmEmailResendHtml };
