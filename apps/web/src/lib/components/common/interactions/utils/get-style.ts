import cn from "$lib/utils/cn";

import { InteractionColor } from "../enums/color";
import { InteractionEmphasis } from "../enums/emphasis";

function getInteractionStyle(
  color: InteractionColor,
  emphasis: InteractionEmphasis = InteractionEmphasis.Secondary,
) {
  const baseStyle = cn(
    "block h-min w-min cursor-pointer rounded-[1.25rem] px-4 py-2 text-center transition-colors disabled:pointer-events-none disabled:cursor-auto",
  );

  switch (emphasis) {
    case InteractionEmphasis.Primary:
      return cn(baseStyle, "font-bold", {
        "bg-sky-600 text-stone-50 active:bg-sky-800! disabled:bg-stone-300 hocus:bg-sky-700":
          color === InteractionColor.Default,
        "dark:bg-sky-700 dark:text-stone-50 dark:active:bg-sky-900! dark:disabled:bg-stone-700 dark:disabled:text-stone-500 dark:hocus:bg-sky-800":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Secondary:
      return cn(baseStyle, {
        "bg-sky-100 text-sky-700 active:bg-sky-300! disabled:bg-stone-200 disabled:text-stone-400 hocus:bg-sky-200":
          color === InteractionColor.Default,
        "dark:bg-sky-950 dark:text-sky-400 dark:active:bg-sky-800! dark:disabled:bg-stone-800 dark:disabled:text-stone-500 dark:hocus:bg-sky-900":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Text:
      return cn(baseStyle, "-mx-0.5 inline-block rounded px-1 py-0 underline", {
        "active:text-sky-700! hocus:bg-stone-900/5 hocus:text-sky-600":
          color === InteractionColor.Default,
        "dark:active:text-sky-600! dark:hocus:bg-stone-100/5 dark:hocus:text-sky-500":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Header:
      return cn(
        baseStyle,
        "flex h-auto items-center rounded-full px-3 py-0 whitespace-nowrap",
        {
          "active:bg-sky-300/80! hocus:bg-sky-300/50":
            color === InteractionColor.Default,
          "dark:active:bg-sky-800/80! dark:hocus:bg-sky-800/50":
            color === InteractionColor.Default,
        },
      );
  }
}

export { getInteractionStyle };
