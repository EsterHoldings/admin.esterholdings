import type { SupportToolbarProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportToolbarSetup(props: SupportToolbarProps) {
  const refs = toRefs(props);

  const archiveFilterLabel = computed(() =>
    props.showArchived ? props.supportListText.archived : props.supportListText.active
  );
  const canShowViewModeToggle = computed(() => !props.isMobileViewport);

  return {
    ...refs,
    archiveFilterLabel,
    canShowViewModeToggle,
  };
}
