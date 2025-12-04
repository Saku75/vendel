<script lang="ts">
  import type { WishesGetResponse } from "@app/api/types";

  import {
    wishBrandValidator,
    wishDescriptionValidator,
    wishPriceValidator,
    wishTitleValidator,
    wishUrlValidator,
  } from "@package/validators/wishes";

  import { invalidateAll } from "$app/navigation";

  import { api } from "$lib/api";
  import NumberInput from "$lib/components/form/components/number-input.svelte";
  import TextInput from "$lib/components/form/components/text-input.svelte";
  import FormSubmit from "$lib/components/form/components/utils/form-submit.svelte";
  import { setFormContext } from "$lib/components/form/context.svelte";
  import { FieldType } from "$lib/components/form/enums/field/type";
  import Form from "$lib/components/form/form.svelte";
  import type {
    Fields,
    NumberField,
    TextField,
  } from "$lib/components/form/types/field";

  interface Props {
    wishlistId: string;

    editItem?: WishesGetResponse;

    onsubmit?: () => void | Promise<void>;
  }

  const { wishlistId, editItem, onsubmit }: Props = $props();

  interface WishFrom extends Fields {
    title: Required<TextField>;
    brand: TextField;
    description: TextField;
    price: NumberField;
    url: TextField;
  }

  const formContext = setFormContext<WishFrom>("wish");

  async function handleSubmit() {
    const formValues = formContext.getValues();

    const response = editItem
      ? await api.wishlists.wishes.update(wishlistId, editItem.id, {
          title: formValues.title,
          brand: formValues.brand,
          description: formValues.description,
          price: formValues.price,
          url: formValues.url,
        })
      : await api.wishlists.wishes.create(wishlistId, {
          title: formValues.title,
          brand: formValues.brand,
          description: formValues.description,
          price: formValues.price,
          url: formValues.url,
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
    key="title"
    type={FieldType.Text}
    label="Navn"
    validator={wishTitleValidator}
    initialValue={editItem?.title}
    required
  />
  <TextInput
    key="brand"
    type={FieldType.Text}
    label="Mærke"
    validator={wishBrandValidator}
    initialValue={editItem?.brand ?? undefined}
  />
  <TextInput
    key="description"
    type={FieldType.Text}
    label="Beskrivelse"
    validator={wishDescriptionValidator}
    initialValue={editItem?.description ?? undefined}
  />
  <NumberInput
    key="price"
    label="Pris"
    validator={wishPriceValidator}
    initialValue={editItem?.price ?? undefined}
  />
  <TextInput
    key="url"
    type={FieldType.Text}
    label="Link"
    validator={wishUrlValidator}
    initialValue={editItem?.url ?? undefined}
  />

  <FormSubmit
    label={editItem ? "Opdater" : "Opret"}
    submittingLabel={editItem ? "Opdaterer..." : "Opretter..."}
  />
</Form>
