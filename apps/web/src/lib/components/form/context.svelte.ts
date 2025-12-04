import { getContext, setContext } from "svelte";

import type { ValidatorCode } from "@package/validators";

import { FieldType } from "./enums/field/type";
import type { FormContext } from "./types/context";
import type { Field, Fields, FieldValues } from "./types/field";

function formContextName(name: string) {
  return `form-context-${name}`;
}

function setFormContext<T extends Fields>(name: string) {
  const formContext = $state<FormContext<T>>({
    name,

    isDirty: false,
    isValid: false,
    generalError: undefined,

    isSubmitting: false,

    fields: {},

    addField<F extends Field>(field: F): { fieldId: string; fieldContext: F } {
      if (this.fields[field.key])
        throw new Error(`Form: '${field.key}' field already exists`);

      this.fields[field.key as keyof T] = field as unknown as T[keyof T];

      if (field.type !== FieldType.Captcha) {
        field.value = field.initialValue;
      }

      return {
        fieldId: `${this.name}-field-${field.key}`,
        fieldContext: this.fields[field.key] as unknown as F,
      };
    },
    removeField(key) {
      delete this.fields[key];
    },

    reset() {
      this.resetCaptchas();

      this.generalError = undefined;

      for (const field in this.fields) {
        if (
          !this.fields[field] ||
          this.fields[field].type === FieldType.Captcha
        )
          break;

        this.fields[field].value = this.fields[field].initialValue;
        this.fields[field].isTouched = false;
      }
    },
    resetCaptchas() {
      for (const field in this.fields) {
        if (
          this.fields[field] &&
          this.fields[field].type === FieldType.Captcha
        ) {
          this.fields[field].reset?.();
        }
      }
    },

    getValues() {
      const values = {} as FieldValues<T>;

      for (const key in this.fields) {
        const field = this.fields[key];
        if (field && field.value !== undefined) {
          values[key as keyof T] = field.value;
        } else {
          throw new Error(`Form: missing value for field '${key}'`);
        }
      }

      return values;
    },

    setGeneralError(error) {
      this.generalError = error;
    },
    setErrors(errors) {
      if (!errors) return;

      for (const error of errors) {
        const fieldKey = error.path[0]?.toString();
        if (fieldKey && this.fields[fieldKey]) {
          this.fields[fieldKey].error = error.message as ValidatorCode;
        }
      }
    },
  });

  return setContext(formContextName(name), formContext);
}

function getFormContext<T extends Fields>(name: string) {
  return getContext<FormContext<T>>(formContextName(name));
}

export { formContextName, getFormContext, setFormContext };
