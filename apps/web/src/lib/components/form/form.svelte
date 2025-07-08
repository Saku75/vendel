<script lang="ts">
  import { hasContext, type Snippet } from "svelte";

  import cn from "$lib/utils/cn";

  import { setFormConfig } from "./config.svelte";
  import { formContextName, getFormContext } from "./context.svelte";
  import { FieldType } from "./enums/field/type";

  interface Props {
    name: string;

    onsubmit?: () => void | Promise<void>;
    onreset?: () => void | Promise<void>;

    class?: string;

    children: Snippet;
  }

  const { name, onsubmit, onreset, class: classes, children }: Props = $props();

  if (!hasContext(formContextName(name)))
    throw new Error(
      `Form: '${name}' form context could not be found, does it exist?`,
    );

  setFormConfig({ name });
  const formContext = getFormContext(name);

  $effect(() => {
    for (const field in formContext.fields) {
      if (!formContext.fields[field]) break;

      if (
        !formContext.fields[field].isValid ||
        (formContext.fields[field].type === FieldType.Captcha &&
          !!formContext.fields[field].error)
      ) {
        formContext.isValid = false;
        break;
      }

      formContext.isValid = true;
    }
  });

  $effect(() => {
    for (const field in formContext.fields) {
      if (
        !formContext.fields[field] ||
        formContext.fields[field].type === FieldType.Captcha
      )
        break;

      if (
        formContext.fields[field].value !==
          formContext.fields[field].initialValue ||
        formContext.fields[field].isTouched
      ) {
        formContext.isDirty = true;
        break;
      }

      formContext.isDirty = false;
    }
  });

  $effect(() => {
    let required = 0;
    let optional = 0;

    for (const field in formContext.fields) {
      if (
        !formContext.fields[field] ||
        formContext.fields[field].type === FieldType.Captcha
      )
        break;

      if (formContext.fields[field].required) {
        required++;
      } else {
        optional++;
      }
    }

    formContext.majorityRequired = required >= optional;
  });

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (!formContext.isDirty || !formContext.isValid) return;

    formContext.isSubmitting = true;
    await onsubmit?.();
    formContext.isSubmitting = false;
  }

  async function handleReset(event: Event) {
    event.preventDefault();

    formContext.reset();

    await onreset?.();
  }
</script>

<form
  class={cn("flex flex-col gap-3", classes)}
  novalidate
  onsubmit={handleSubmit}
  onreset={handleReset}
>
  {@render children()}
</form>
