import z from "zod";

const password = {
  plain: z
    .string({
      required_error: "Adgangskode skal udfyldes.",
      invalid_type_error: "Adgangskode skal være tekst.",
    })
    .min(10, "Adgangskode skal være mindst 10 tegn.")
    .max(64, "Adgangskode må højst være 64 tegn.")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])/,
      "Adgangskode skal indeholde mindst ét stort bogstav, ét lille bogstav, et tal og et specialtegn.",
    ),

  confirm: z.string({
    required_error: "Bekræft adgangskode skal udfyldes.",
    invalid_type_error: "Bekræft adgangskode skal være tekst.",
  }),

  hash: z
    .string({
      required_error: "Adgangskode-hash mangler.",
      invalid_type_error: "Adgangskode-hash skal være en streng.",
    })
    .nonempty("Noget gik galt - prøv igen senere."),
};

export { password };
