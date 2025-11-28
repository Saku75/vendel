import { redirect } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, locals }) => {
  const token = url.searchParams.get("token");

  if (!token) return redirect(307, "/");

  const confirmed = await locals.api.user.email.confirm({ token });

  let status: boolean;
  let message: string;

  if (confirmed.ok) {
    status = true;
    message = "Din e-mailadresse er nu bekræftet!";
  } else {
    status = false;

    if (confirmed.status === 400) {
      message = "Bekræftelseslink er ugyldigt eller udløbet.";
    } else if (confirmed.status === 404) {
      message = "Brugeren blev ikke fundet.";
    } else {
      message = "Der opstod en fejl under bekræftelse af e-mailadressen.";
    }
  }

  return {
    emailConfirmed: {
      status,
      message,
    },
  };
};
