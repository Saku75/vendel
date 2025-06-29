import type { Field, Fields, FieldValues } from "./field";

interface FormContext<T extends Fields> {
  name: string;

  isDirty: boolean;
  isValid: boolean;

  majorityRequired: boolean;

  fields: Partial<T>;
  addField: <F extends Field>(field: F) => [string, F];
  removeField: (key: string) => void;

  reset: () => void;

  getValues: () => FieldValues<T>;
}

export type { FormContext };
