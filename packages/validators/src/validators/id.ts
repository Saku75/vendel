import { z } from "zod";

const id = z
  .string({
    required_error: "ID mangler.",
    invalid_type_error: "ID skal være en streng.",
  })
  .nonempty("Noget gik galt - prøv igen senere.")
  .cuid2("Ugyldigt ID - prøv igen eller kontakt support.");

export { id };
