import { baseLayout } from "../../layouts/base";

const welcomeHtml = baseLayout(`<p>Hej {{name}},</p>

    <p>Velkommen til Vendel.dk! Vi er glade for at have dig med.</p>

    <p>Klik på linket herunder for at bekræfte din e-mailadresse:<br />
    <a href="{{baseUrl}}/confirm-email?token={{token}}">Bekræft e-mail</a></p>

    <p>Linket udløber om 24 timer. Du kan få et nyt ved at logge ind igen.</p>

    <p>Når din e-mail er bekræftet, vil en administrator gennemgå din konto.<br />
    Du modtager en e-mail, så snart din konto er godkendt.</p>

    <p>Hvis du ikke selv har oprettet en konto hos Vendel.dk, kan du bare ignorere denne mail.</p>`);

export { welcomeHtml };
