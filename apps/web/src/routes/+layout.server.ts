import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ platform }) => {
  return {
    config: {
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    },
  };
};
