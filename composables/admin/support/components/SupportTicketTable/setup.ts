import type { SupportTicketTableProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportTicketTableSetup(props: SupportTicketTableProps) {
  const refs = toRefs(props);

  const isLastMessageSortActive = computed(() => props.orderBy === "last_message_at");
  const isStatusSortActive = computed(() => props.orderBy === "status");
  const isAdminPopoverVisible = (ticket: any, admin: any): boolean =>
    props.activeAdminPopoverKey === props.getAdminParticipantKey(ticket, admin);
  const hasTicketUnreadMessages = (ticket: any): boolean => Number(ticket?.unread_messages_count ?? 0) > 0;
  const isCompleteActionDisabled = (ticket: any): boolean =>
    !props.canUpdateSupport ||
    props.showArchived ||
    props.isTicketCompleted(ticket) ||
    props.isTicketActionLoading(ticket);

  return {
    ...refs,
    hasTicketUnreadMessages,
    isAdminPopoverVisible,
    isCompleteActionDisabled,
    isLastMessageSortActive,
    isStatusSortActive,
  };
}
