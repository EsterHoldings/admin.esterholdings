import { ref } from "vue";
import type { DashboardSummaryCard } from "~/pages/admin/dashboard/types";
import { DASHBOARD_ONLINE_CARD_ID, type DashboardSummaryGridEmit } from "./index";

export function useDashboardSummaryGridSetup(emit: DashboardSummaryGridEmit) {
  const isOnlinePopoverOpen = ref(false);

  function isOnlineCard(card: DashboardSummaryCard): boolean {
    return card.id === DASHBOARD_ONLINE_CARD_ID;
  }

  function openOnlinePopover(card: DashboardSummaryCard): void {
    if (!isOnlineCard(card)) {
      return;
    }

    isOnlinePopoverOpen.value = true;
  }

  function closeOnlinePopover(card: DashboardSummaryCard): void {
    if (!isOnlineCard(card)) {
      return;
    }

    isOnlinePopoverOpen.value = false;
  }

  function handleCardFocusOut(card: DashboardSummaryCard, event: FocusEvent | Event): void {
    if (!isOnlineCard(card)) {
      return;
    }

    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = (event as FocusEvent).relatedTarget as Node | null;
    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    isOnlinePopoverOpen.value = false;
  }

  function handleNavigate(to: string): void {
    emit("navigate", to);
  }

  function handleClientNavigate(id: string): void {
    emit("navigate", `/clients/${id}`);
  }

  return {
    closeOnlinePopover,
    handleCardFocusOut,
    handleClientNavigate,
    handleNavigate,
    isOnlinePopoverOpen,
    isOnlineCard,
    openOnlinePopover,
  };
}
