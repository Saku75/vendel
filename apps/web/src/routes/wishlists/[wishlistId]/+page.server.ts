import { error } from "@sveltejs/kit";

import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const [wishlistResponse, wishesResponse] = await Promise.all([
    locals.api.wishlists.get(params.wishlistId),
    locals.api.wishlists.wishes.list(params.wishlistId),
  ]);

  if (!wishlistResponse.ok) {
    error(404, "Wishlist not found");
  }

  return {
    wishlist: wishlistResponse.data,
    wishes: wishesResponse.ok ? wishesResponse.data : [],
  };
};
