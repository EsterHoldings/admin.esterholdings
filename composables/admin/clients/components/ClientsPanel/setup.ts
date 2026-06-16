import { computed } from "vue";
import type { ClientsPanelProps } from "~/composables/admin/clients/components/ClientsPanel";

export function useClientsPanelSetup(props: ClientsPanelProps) {
  const contentIsPlain = computed(() => props.viewMode !== "table");
  const isRefreshSpinning = computed(() => props.isLoading || props.isStatsLoading);
  const showContentLoading = computed(() => props.isLoading && !props.isInitialLoading);
  const showTableEmpty = computed(() => !props.isLoading && !props.isInitialLoading);

  return {
    contentIsPlain,
    isRefreshSpinning,
    showContentLoading,
    showTableEmpty,
  };
}
