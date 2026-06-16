import type { DashboardSummaryCard } from "~/pages/admin/dashboard/types";
import { DASHBOARD_ONLINE_CARD_ID, type DashboardSummaryGridEmit } from "./index";

export function useDashboardSummaryGridSetup(emit: DashboardSummaryGridEmit) {
  function isOnlineCard(card: DashboardSummaryCard): boolean {
    return card.id === DASHBOARD_ONLINE_CARD_ID;
  }

  function handleNavigate(to: string): void {
    emit("navigate", to);
  }

  function handleClientNavigate(id: string): void {
    emit("navigate", `/clients/${id}`);
  }

  return {
    handleClientNavigate,
    handleNavigate,
    isOnlineCard,
  };
}
