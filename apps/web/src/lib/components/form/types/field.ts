import { z } from "zod";

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

  validator?: z.ZodType;
  error?: string;

  isTouched: boolean;
  isValid: boolean;
}

interface TextField extends CommonField {
  readonly type: FieldType.Text | FieldType.Email | FieldType.Password;

  value?: string;
  initialValue: string;

  validator?: z.ZodString | z.ZodOptional<z.ZodString>;
}

interface CaptchaField
  extends Pick<CommonField, "key" | "type" | "value" | "error"> {
  readonly type: FieldType.Captcha;

  value?: string;

  action?: string;

  reset?: () => void;
}

type Field = TextField | CaptchaField;

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
  Require,
  TextField,
};
