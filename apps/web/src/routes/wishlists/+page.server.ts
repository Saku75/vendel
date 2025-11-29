import type { LayoutServerLoad } from "../$types";

export const load: LayoutServerLoad = async ({ locals }) => {
  const wishlistsResponse = await locals.api.wishlists.list();

  if (wishlistsResponse.ok) {
    return {
      wishlists: wishlistsResponse.data,
    };
  }

  return {
    wishlists: [],
  };
};
