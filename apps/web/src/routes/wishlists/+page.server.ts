import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const wishlistsResponse = await locals.api.wishlists.list();

  return {
    wishlists: wishlistsResponse.ok ? wishlistsResponse.data : [],
  };
};
