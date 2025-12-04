<script lang="ts">
  import { onDestroy } from "svelte";
  import type { FullAutoFill } from "svelte/elements";

  import type { ValidatorCode } from "@package/validators";

  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../config.svelte";
  import { getFormContext } from "../context.svelte";
  import { FieldOrientation } from "../enums/field/orientation";
  import { FieldType } from "../enums/field/type";
  import type { NumberField } from "../types/field";
  import { getValidatorMessage } from "../utils/get-validator-message";

  interface Props {
    readonly key: NumberField["key"];
    label: NumberField["label"];

    autocomplete?: FullAutoFill;

    required?: NumberField["required"];
    disabled?: NumberField["disabled"];
    readonly?: NumberField["readonly"];

    initialValue?: NumberField["initialValue"];

    validator?: NumberField["validator"];

    class?: string;
    orientation?: FieldOrientation;
  }

  const {
    key,
    label,

    autocomplete,

    required = false,
    disabled = false,
    readonly = false,

    initialValue = null,

    validator,

    class: classes,
    orientation = FieldOrientation.Vertical,
  }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);

  const { fieldId, fieldContext } = formContext.addField<NumberField>({
    key,
    type: FieldType.Number,
    label,
    required,
    disabled,
    readonly,
    initialValue,
    validator,
    isTouched: false,
    isValid: false,
  });

  $effect(() => {
    if (!fieldContext.validator) return;

    const result = fieldContext.validator.safeParse(fieldContext.value);

    if (result.success) {
      fieldContext.isValid = true;
      fieldContext.error = undefined;
    } else {
      fieldContext.isValid = false;
      fieldContext.error = result.error.issues[0].message as ValidatorCode;
    }
  });

  onDestroy(() => {
    formContext.removeField(key);
  });
</script>

<label
  for={fieldId}
  class={cn(
    "flex w-full gap-1",
    {
      "flex-col": orientation === FieldOrientation.Vertical,
      "flex-row": orientation === FieldOrientation.Horizontal,
    },
    classes,
  )}
>
  <span class="flex items-center gap-1 px-4">
    {fieldContext.label}
    {#if formContext.majorityRequired !== undefined}
      {#if fieldContext.required && !formContext.majorityRequired}
        <span class="text-sm text-red-700 dark:text-red-500">*</span>
      {/if}
      {#if !fieldContext.required && formContext.majorityRequired}
        <span class="text-sm text-stone-600 dark:text-stone-400">(Valgfri)</span
        >
      {/if}
    {/if}
  </span>

  <input
    class="rounded-[1.25rem] bg-inherit px-4"
    id={fieldId}
    type={fieldContext.type}
    required={fieldContext.required}
    disabled={fieldContext.disabled}
    readonly={fieldContext.readonly || formContext.isSubmitting}
    bind:value={fieldContext.value}
    oninput={() => (fieldContext.isTouched = true)}
    {autocomplete}
  />

  {#if fieldContext.error && fieldContext.isTouched}
    <span class="px-4 text-sm text-red-700 dark:text-red-500">
      {getValidatorMessage(fieldContext.error)}
    </span>
  {/if}
</label>
