import type { z } from "zod/mini";

import type { Field, Fields, FieldValues } from "./field";

interface FormContext<T extends Fields> {
  name: string;

  isDirty: boolean;
  isValid: boolean;
  generalError?: string;

  isSubmitting: boolean;

  majorityRequired?: boolean;

  fields: Partial<T>;
  addField: <F extends Field>(field: F) => { fieldId: string; fieldContext: F };
  removeField: (key: string) => void;

  reset: () => void;
  resetCaptchas: () => void;

  getValues: () => FieldValues<T>;

  setGeneralError: (error: string | undefined) => void;
  setErrors: (errors: z.core.$ZodIssue[] | undefined) => void;
}

export type { FormContext };
