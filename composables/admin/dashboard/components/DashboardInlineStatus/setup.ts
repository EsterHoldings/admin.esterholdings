import { computed } from "vue";
import { DASHBOARD_STATUS_TONE_CLASS_MAP, type DashboardInlineStatusProps } from "./index";

export function useDashboardInlineStatusSetup(props: DashboardInlineStatusProps) {
  const toneClass = computed(() => DASHBOARD_STATUS_TONE_CLASS_MAP[props.tone ?? "muted"]);

  return {
    toneClass,
  };
}
