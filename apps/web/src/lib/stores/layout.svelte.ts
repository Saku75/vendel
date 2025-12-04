import type { LayoutMenuContent } from "$lib/enums/layout/menu/content";

type LayoutStore = {
  menu: {
    open: boolean;
    toggle: (content: LayoutMenuContent) => void;
    content?: LayoutMenuContent;
  };
  size: {
    height?: number;
    width?: number;
  };
};

const layoutStore = $state<LayoutStore>({
  menu: {
    open: false,
    toggle: function (content) {
      if (this.content === content) {
        this.open = !this.open;
      } else {
        this.open = true;
        this.content = content;
      }
    },
  },
  size: {
    width: undefined,
    height: undefined,
  },
});

export { layoutStore };
