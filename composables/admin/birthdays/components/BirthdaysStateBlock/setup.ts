import { computed } from "vue";
import type { BirthdaysStateBlockProps } from "./index";

export function useBirthdaysStateBlockSetup(props: BirthdaysStateBlockProps) {
  const blockClass = computed(() => [
    "flex min-h-[280px] items-center justify-center gap-2.5 text-center text-sm font-semibold",
    props.danger ? "text-[var(--ui-sticker-danger)]" : "text-[var(--ui-text-secondary)]",
  ]);

  return {
    blockClass,
  };
}
