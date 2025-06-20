import { z } from "zod";

const name = {
  first: z
    .string({
      required_error: "Fornavn skal udfyldes.",
      invalid_type_error: "Fornavn skal være tekst.",
    })
    .nonempty("Fornavn skal udfyldes.")
    .max(50, "Fornavn må højst være 50 tegn."),

  middle: z
    .string({
      required_error: "Mellemnavn skal udfyldes.",
      invalid_type_error: "Mellemnavn skal være tekst.",
    })
    .max(200, "Mellemnavn må højst være 200 tegn.")
    .optional(),

  last: z
    .string({
      required_error: "Efternavn skal udfyldes.",
      invalid_type_error: "Efternavn skal være tekst.",
    })
    .max(50, "Efternavn må højst være 50 tegn.")
    .optional(),
};

export { name };
