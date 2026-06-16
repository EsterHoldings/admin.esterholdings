import { computed } from "vue";
import type { AccountsPanelProps } from "./index";

export function useAccountsPanelSetup(props: AccountsPanelProps) {
  const showCardsLoading = computed(() => props.isLoading && !props.isInitialLoading);

  return {
    showCardsLoading,
  };
}
