import { computed } from "vue";
import {
  DASHBOARD_SUMMARY_CARD_BASE_CLASS,
  DASHBOARD_SUMMARY_ICON_BASE_CLASS,
  DASHBOARD_SUMMARY_ICON_CLASS_MAP,
  DASHBOARD_SUMMARY_TONE_CLASS_MAP,
  type DashboardSummaryCardEmit,
  type DashboardSummaryCardProps,
} from "./index";

export function useDashboardSummaryCardSetup(props: DashboardSummaryCardProps, emit: DashboardSummaryCardEmit) {
  const cardClass = computed(() => [
    DASHBOARD_SUMMARY_CARD_BASE_CLASS,
    DASHBOARD_SUMMARY_TONE_CLASS_MAP[props.card.kind],
  ]);

  const iconClass = computed(() => [
    DASHBOARD_SUMMARY_ICON_BASE_CLASS,
    DASHBOARD_SUMMARY_ICON_CLASS_MAP[props.card.kind],
  ]);

  function handleOpen(): void {
    emit("open", props.card.to);
  }

  return {
    cardClass,
    handleOpen,
    iconClass,
  };
}
