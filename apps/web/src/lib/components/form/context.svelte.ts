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

    fields: {},

    addField<F extends Field>(field: F): [string, F] {
      if (this.fields[field.key])
        throw new Error(`Form: '${field.key}' field already exists`);

      this.fields[field.key as keyof T] = field as unknown as T[keyof T];

      if (field.type !== FieldType.Captcha) {
        field.value = field.initialValue;
      }

      return [
        `${this.name}-field-${field.key}`,
        this.fields[field.key],
      ] as unknown as [string, F];
    },
    removeField(key) {
      delete this.fields[key];
    },

    reset() {
      this.resetCaptchas();

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

    setErrors(errors) {
      if (!errors) return;

      this.resetCaptchas();

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
