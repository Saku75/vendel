import type { z } from "zod";

import type { Field, Fields, FieldValues } from "./field";

interface FormContext<T extends Fields> {
  name: string;

  isDirty: boolean;
  isValid: boolean;

  isSubmitting: boolean;

  majorityRequired?: boolean;

  fields: Partial<T>;
  addField: <F extends Field>(field: F) => [string, F];
  removeField: (key: string) => void;

  reset: () => void;
  resetCaptchas: () => void;

  getValues: () => FieldValues<T>;

  setErrors: (errors: z.ZodIssue[] | undefined) => void;
}

export type { FormContext };
