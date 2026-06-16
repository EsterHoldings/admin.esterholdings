import { computed } from "vue";
import {
  VERIFICATION_CHANGE_CHIP_BASE_CLASS,
  VERIFICATION_CHANGE_CHIP_UNREAD_CLASS,
  VERIFICATION_REQUEST_CARD_BASE_CLASS,
  VERIFICATION_REQUEST_CARD_PENDING_CLASS,
  VERIFICATION_REQUEST_CARD_UNREAD_CLASS,
  VERIFICATION_STATUS_TEXT_CLASS_MAP,
  type VerificationRequestCardEmit,
  type VerificationRequestCardProps,
} from "./index";
import type { ReviewFocusItem, VerificationRequestNextState } from "~/composables/admin/verifications/types";

export function useVerificationRequestCardSetup(
  props: VerificationRequestCardProps,
  emit: VerificationRequestCardEmit
) {
  const focusItems = computed(() => props.requestFocusItems(props.requestItem));
  const clientName = computed(() => props.displayClientName(props.requestItem));
  const clientInitials = computed(() => props.displayClientInitials(props.requestItem));
  const updatedAt = computed(() => props.formatUpdatedAt(props.requestItem));
  const statusText = computed(() => props.requestStateText(props.requestItem.request_state));
  const isUnread = computed(() => props.hasUnreadVerificationSignal(props.requestItem.user_id));
  const isPending = computed(() => props.requestItem.request_state === "pending");
  const isAnyUpdating = computed(() => props.isUpdating(props.requestItem.id));
  const isApproveUpdating = computed(() => props.isUpdating(props.requestItem.id, "approved"));
  const isRejectUpdating = computed(() => props.isUpdating(props.requestItem.id, "rejected"));
  const email = computed(() => props.requestItem.user.email || "-");

  const cardClass = computed(() => [
    VERIFICATION_REQUEST_CARD_BASE_CLASS,
    isPending.value ? VERIFICATION_REQUEST_CARD_PENDING_CLASS : "",
    isUnread.value ? VERIFICATION_REQUEST_CARD_UNREAD_CLASS : "",
  ]);

  const statusClass = computed(() => [
    "inline-flex items-center gap-[7px] text-xs font-extrabold",
    VERIFICATION_STATUS_TEXT_CLASS_MAP[props.requestItem.request_state],
  ]);

  function changeChipClass(item: ReviewFocusItem): string[] {
    return [
      VERIFICATION_CHANGE_CHIP_BASE_CLASS,
      props.hasUnreadVerificationSignal(props.requestItem.user_id, item.section)
        ? VERIFICATION_CHANGE_CHIP_UNREAD_CLASS
        : "",
    ];
  }

  function handleOpen(): void {
    emit("open", props.requestItem);
  }

  function handleOpenFocus(item: ReviewFocusItem): void {
    emit("open", props.requestItem, item.tab, item.section);
  }

  function handleReview(nextState: VerificationRequestNextState): void {
    emit("review", props.requestItem, nextState);
  }

  return {
    cardClass,
    changeChipClass,
    clientInitials,
    clientName,
    email,
    focusItems,
    handleOpen,
    handleOpenFocus,
    handleReview,
    isAnyUpdating,
    isApproveUpdating,
    isPending,
    isRejectUpdating,
    statusClass,
    statusText,
    updatedAt,
  };
}
