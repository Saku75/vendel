import cn from "$lib/utils/cn";

import { InteractionColor } from "../enums/color";
import { InteractionEmphasis } from "../enums/emphasis";

function getInteractionStyle(
  color: InteractionColor,
  emphasis: InteractionEmphasis = InteractionEmphasis.Secondary,
) {
  const baseStyle = cn(
    "block cursor-pointer rounded-[1.25rem] px-4 py-2 text-center transition-colors disabled:pointer-events-none disabled:cursor-auto",
  );

  switch (emphasis) {
    case InteractionEmphasis.Primary:
      return cn(baseStyle, "font-bold", {
        "bg-sky-600 text-stone-50 hover:bg-sky-700 focus:bg-sky-700 active:bg-sky-800 disabled:bg-stone-300":
          color === InteractionColor.Default,
        "dark:bg-sky-700 dark:text-stone-50 dark:hover:bg-sky-800 dark:focus:bg-sky-800 dark:active:bg-sky-900 dark:disabled:bg-stone-700 dark:disabled:text-stone-500":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Secondary:
      return cn(baseStyle, {
        "bg-sky-100 text-sky-700 hover:bg-sky-200 focus:bg-sky-200 active:bg-sky-300 disabled:bg-stone-200 disabled:text-stone-400":
          color === InteractionColor.Default,
        "dark:bg-sky-950 dark:text-sky-400 dark:hover:bg-sky-900 dark:focus:bg-sky-900 dark:active:bg-sky-800 dark:disabled:bg-stone-800 dark:disabled:text-stone-500":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Text:
      return cn(baseStyle, "-mx-0.5 inline-block rounded px-1 py-0 underline", {
        "hover:bg-stone-900/5 hover:text-sky-600 focus:bg-stone-900/5 focus:text-sky-600 active:text-sky-700":
          color === InteractionColor.Default,
        "dark:hover:bg-stone-100/5 dark:hover:text-sky-500 dark:focus:bg-stone-100/5 dark:focus:text-sky-500 dark:active:text-sky-600":
          color === InteractionColor.Default,
      });
    case InteractionEmphasis.Header:
      return cn(
        baseStyle,
        "flex h-auto items-center rounded-full px-3 py-0 whitespace-nowrap",
        {
          "hover:bg-sky-300/50 focus:bg-sky-300/50 active:bg-sky-300/80":
            color === InteractionColor.Default,
          "dark:hover:bg-sky-800/50 dark:focus:bg-sky-800/50 dark:active:bg-sky-800/80":
            color === InteractionColor.Default,
        },
      );
  }
}

export { getInteractionStyle };
