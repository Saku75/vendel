import { z } from "zod";

const email = z
  .string({
    required_error: "E-mail skal udfyldes.",
    invalid_type_error: "E-mail skal være en tekst.",
  })
  .nonempty("E-mail skal udfyldes.")
  .max(320, "E-mail må højst være 320 tegn.")
  .email("Ugyldigt e-mailformat.");

export { email };
