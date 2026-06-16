import type { SupportTicketCardsProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportTicketCardsSetup(props: SupportTicketCardsProps) {
  const refs = toRefs(props);

  const hasTickets = computed(() => props.tickets.length > 0);
  const ticketGridClass = computed(() =>
    props.viewMode === "full" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
  );
  const getTicketCardClass = (ticket: any): string[] => [
    "ticket-card cursor-pointer rounded-xl border border-[var(--color-stroke-ui-dark)] bg-[var(--ui-background-panel)] p-4 transition hover:bg-[var(--color-stroke-ui-dark)]",
    props.viewMode === "full" ? "ticket-card--full-row" : "",
  ];
  const isAdminPopoverVisible = (ticket: any, admin: any): boolean =>
    props.activeAdminPopoverKey === props.getAdminParticipantKey(ticket, admin);
  const isTicketActionMenuOpen = (ticket: any): boolean => props.openTicketActionMenuId === String(ticket?.id ?? "");
  const hasTicketUnreadMessages = (ticket: any): boolean => Number(ticket?.unread_messages_count ?? 0) > 0;
  const getTicketStatusActionTitle = (action: any): string =>
    props.supportListText.setStatusTitle.replace("{status}", String(action?.label ?? ""));
  const isTicketStatusActionDisabled = (ticket: any, status: string): boolean =>
    !props.canUpdateSupport || props.isTicketStatusActive(ticket, status) || props.isTicketActionLoading(ticket);

  return {
    ...refs,
    getTicketCardClass,
    getTicketStatusActionTitle,
    hasTicketUnreadMessages,
    hasTickets,
    isAdminPopoverVisible,
    isTicketActionMenuOpen,
    isTicketStatusActionDisabled,
    ticketGridClass,
  };
}
