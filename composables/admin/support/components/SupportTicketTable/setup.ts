import type { SupportTicketTableProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportTicketTableSetup(props: SupportTicketTableProps) {
  const refs = toRefs(props);

  const isLastMessageSortActive = computed(() => props.orderBy === "last_message_at");
  const isStatusSortActive = computed(() => props.orderBy === "status");
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
    getTicketStatusActionTitle,
    hasTicketUnreadMessages,
    isAdminPopoverVisible,
    isLastMessageSortActive,
    isStatusSortActive,
    isTicketActionMenuOpen,
    isTicketStatusActionDisabled,
  };
}
