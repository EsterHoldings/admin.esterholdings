import type { VerificationRequestNextState } from "~/composables/admin/verifications/types";

export type VerificationReviewDialogProps = {
  visible: boolean;
  submitting: boolean;
  sendNotifications: boolean;
  nextState: VerificationRequestNextState | null;
  title: string;
  message: string;
  approveLabel: string;
  rejectLabel: string;
  cancelLabel: string;
  sendNotificationsLabel: string;
};

export type VerificationReviewDialogEmits = {
  "update:sendNotifications": [value: boolean];
  close: [];
  confirm: [];
};

export type VerificationReviewDialogEmit = {
  (event: "update:sendNotifications", value: boolean): void;
  (event: "close"): void;
  (event: "confirm"): void;
};
