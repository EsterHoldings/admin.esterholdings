import type { SupportPanelProps } from ".";
import { computed, toRefs } from "vue";

export function useSupportPanelSetup(props: SupportPanelProps) {
  const refs = toRefs(props);

  const supportChildProps = computed(() => props);
  const titleLabel = computed(() => props.t("admin.support.title"));
  const isTableMode = computed(() => props.viewMode === "table");
  const isChatOpen = computed(() => Boolean(props.currentTicketIdForChat));
  const isCurrentAdminJoined = computed(() => props.isCurrentAdminTicketParticipant(props.currentChatTicket));

  return {
    ...refs,
    isChatOpen,
    isCurrentAdminJoined,
    isTableMode,
    supportChildProps,
    titleLabel,
  };
}
