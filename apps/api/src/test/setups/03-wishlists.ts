import { wishes } from "$lib/database/schema/wishes";
import { wishlists } from "$lib/database/schema/wishlists";

import { testWishes } from "../fixtures/wishes";
import { testWishlists } from "../fixtures/wishlists";
import { testDatabase } from "../utils/database";

// Insert wishlists
for (const wishlist of Object.values(testWishlists)) {
  await testDatabase.insert(wishlists).values(wishlist);
}

// Insert wishes
for (const wish of Object.values(testWishes)) {
  await testDatabase.insert(wishes).values(wish);
}
