<script lang="ts">
  import type { WishlistsGetResponse } from "@app/api/types";

  import {
    wishlistDescriptionValidator,
    wishlistNameValidator,
  } from "@package/validators/wishlist";

  import { invalidateAll } from "$app/navigation";

  import { apiClient } from "$lib/api/client";
  import TextInput from "$lib/components/form/components/text-input.svelte";
  import FormSubmit from "$lib/components/form/components/utils/form-submit.svelte";
  import { setFormContext } from "$lib/components/form/context.svelte";
  import { FieldType } from "$lib/components/form/enums/field/type";
  import Form from "$lib/components/form/form.svelte";
  import type { Fields, TextField } from "$lib/components/form/types/field";

  interface Props {
    editItem?: WishlistsGetResponse;

    onsubmit?: () => void | Promise<void>;
  }

  const { editItem, onsubmit }: Props = $props();

  interface WishlistFrom extends Fields {
    name: Required<TextField>;
    description: TextField;
  }

  const formContext = setFormContext<WishlistFrom>("wishlist");

  async function handleSubmit() {
    const formValues = formContext.getValues();

    const response = editItem
      ? await apiClient.wishlists.update(editItem.id, {
          name: formValues.name,
          description: formValues.description,
        })
      : await apiClient.wishlists.create({
          name: formValues.name,
          description: formValues.description,
        });

    if (!response.ok) {
      formContext.setErrors(response.errors);
      return;
    }

    await invalidateAll();
    await onsubmit?.();
  }
</script>

<Form name={formContext.name} class="items-center" onsubmit={handleSubmit}>
  <TextInput
    key="name"
    type={FieldType.Text}
    label="Navn"
    validator={wishlistNameValidator}
    initialValue={editItem?.name}
    required
  />
  <TextInput
    key="description"
    type={FieldType.Text}
    label="Beskrivelse"
    validator={wishlistDescriptionValidator}
    initialValue={editItem?.description ?? undefined}
  />

  <FormSubmit
    label={editItem ? "Opdater" : "Opret"}
    submittingLabel={editItem ? "Opdaterer..." : "Opretter..."}
  />
</Form>
