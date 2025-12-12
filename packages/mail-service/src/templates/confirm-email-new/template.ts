import { baseLayout } from "../../layouts/base";

const confirmEmailNewHtml = baseLayout(`<p>Hej {{name}},</p>

    <p>Du har tilføjet en ny e-mailadresse til din konto på Vendel.dk.</p>

    <p>Klik på linket herunder for at bekræfte denne e-mailadresse:<br />
    <a href="{{baseUrl}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer.</p>

    <p>Hvis du ikke selv har tilføjet denne e-mailadresse, kan du bare ignorere denne mail.</p>`);

export { confirmEmailNewHtml };
