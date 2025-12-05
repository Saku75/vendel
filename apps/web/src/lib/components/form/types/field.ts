import type { z } from "zod/mini";

import type { ValidatorCode } from "@package/validators";

import type { FieldType } from "../enums/field/type";

interface CommonField {
  readonly key: string;
  readonly type: FieldType;
  label: string;

  required: boolean;
  disabled: boolean;
  readonly: boolean;

  value?: unknown;
  initialValue: unknown;

  validator?: z.core.$ZodType;
  error?: ValidatorCode;

  isTouched: boolean;
  isValid: boolean;
}

interface TextField extends CommonField {
  readonly type: FieldType.Text | FieldType.Email | FieldType.Password;

  value?: string;
  initialValue: string;

  validator?: z.core.$ZodString | z.core.$ZodOptional<z.core.$ZodString>;
}

interface NumberField extends CommonField {
  readonly type: FieldType.Number;

  value?: number | null;
  initialValue: number | null;

  validator?:
    | z.core.$ZodNumber
    | z.core.$ZodOptional<z.core.$ZodNumber>
    | z.core.$ZodNullable<z.core.$ZodNumber>
    | z.core.$ZodOptional<z.core.$ZodNullable<z.core.$ZodNumber>>;
}

interface CaptchaField
  extends Pick<CommonField, "key" | "type" | "value" | "error"> {
  readonly type: FieldType.Captcha;

  value?: string;

  isValid: boolean;

  action?: string;

  reset?: () => void;
}

type Field = TextField | NumberField | CaptchaField;

interface Fields {
  [key: string]: Field;
}

type FieldValues<T extends Fields> = {
  [K in keyof T]: T[K]["value"];
};

type Require<T extends Field> = Omit<T, "value"> & {
  value: NonNullable<T["value"]>;
};

export type {
  CaptchaField,
  CommonField,
  Field,
  Fields,
  FieldValues,
  NumberField,
  Require,
  TextField,
};
