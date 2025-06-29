<script lang="ts">
  import { onDestroy } from "svelte";
  import type { FullAutoFill } from "svelte/elements";

  import cn from "$lib/utils/cn";

  import { getFormConfig } from "../config.svelte";
  import { getFormContext } from "../context.svelte";
  import { FieldOrientation } from "../enums/field/orientation";
  import { FieldType } from "../enums/field/type";
  import type { TextField } from "../types/field";

  interface Props {
    readonly key: TextField["key"];
    readonly type?: TextField["type"];
    label: TextField["label"];

    autocomplete?: FullAutoFill;

    required?: TextField["required"];
    disabled?: TextField["disabled"];
    readonly?: TextField["readonly"];

    initialValue?: TextField["initialValue"];

    validator?: TextField["validator"];

    class?: string;
    orientation?: FieldOrientation;
  }

  const {
    key,
    type = FieldType.Text,
    label,

    autocomplete,

    required = false,
    disabled = false,
    readonly = false,

    initialValue = "",

    validator,

    class: classes,
    orientation = FieldOrientation.Vertical,
  }: Props = $props();

  const formConfig = getFormConfig();
  const formContext = getFormContext(formConfig.name);

  const [fieldId, fieldContext] = formContext.addField<TextField>({
    key,
    type,
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
      fieldContext.error = result.error.issues[0].message;
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
    class="rounded-full bg-inherit px-4"
    id={fieldId}
    type={fieldContext.type}
    required={fieldContext.required}
    disabled={fieldContext.disabled}
    readonly={fieldContext.readonly}
    bind:value={fieldContext.value}
    oninput={() => (fieldContext.isTouched = true)}
    {autocomplete}
  />

  {#if fieldContext.error && fieldContext.isTouched}
    <span class="px-4 text-sm text-red-700 dark:text-red-500">
      {fieldContext.error}
    </span>
  {/if}
</label>
