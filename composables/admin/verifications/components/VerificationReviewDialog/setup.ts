import { computed } from "vue";
import type { VerificationReviewDialogEmit, VerificationReviewDialogProps } from "./index";

export function useVerificationReviewDialogSetup(
  props: VerificationReviewDialogProps,
  emit: VerificationReviewDialogEmit
) {
  const confirmButtonLabel = computed(() => (props.nextState === "approved" ? props.approveLabel : props.rejectLabel));
  const confirmButtonSeverity = computed(() => (props.nextState === "approved" ? "success" : "danger"));

  function handleVisibleUpdate(value: boolean): void {
    if (!value && !props.submitting) {
      emit("close");
    }
  }

  function handleSendNotificationsChange(event: Event): void {
    emit("update:sendNotifications", Boolean((event.target as HTMLInputElement | null)?.checked));
  }

  function handleClose(): void {
    emit("close");
  }

  function handleConfirm(): void {
    emit("confirm");
  }

  return {
    confirmButtonLabel,
    confirmButtonSeverity,
    handleClose,
    handleConfirm,
    handleSendNotificationsChange,
    handleVisibleUpdate,
  };
}
