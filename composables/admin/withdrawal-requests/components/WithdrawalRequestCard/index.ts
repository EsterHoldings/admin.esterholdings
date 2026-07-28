import type {
  WithdrawalEditErrors,
  WithdrawalEditForm,
  WithdrawalPaymentDetailDocument,
  WithdrawalPaymentDetailEntry,
  WithdrawalRequestItem,
  WithdrawalRequestLabels,
  WithdrawalSelectOption,
  WithdrawalStatusAction,
} from "~/composables/admin/withdrawal-requests";

export type WithdrawalRequestCardProps = {
  requestItem: WithdrawalRequestItem;
  labels: WithdrawalRequestLabels;
  canManagePayments: boolean;
  editingRequestId: string;
  updatingRequestId: string;
  auxiliaryLoadingUserId: string;
  notifyClient: boolean;
  editForm: WithdrawalEditForm;
  editErrors: WithdrawalEditErrors;
  accountOptions: WithdrawalSelectOption[];
  paymentDetailOptions: WithdrawalSelectOption[];
  canEditRequest: (requestItem: WithdrawalRequestItem) => boolean;
  canRequestStatusChange: (requestItem: WithdrawalRequestItem) => boolean;
  clientLink: (userId: string) => string;
  formatDateTime: (value: string) => string;
  formatMoney: (value: number, currency: string) => string;
  hasPaymentDetailData: (requestItem: WithdrawalRequestItem) => boolean;
  internalTransferExecutionText: (requestItem: WithdrawalRequestItem) => string;
  isPaymentDetailDocumentImage: (document: WithdrawalPaymentDetailDocument) => boolean;
  isPaymentDetailExpanded: (requestId: string) => boolean;
  isStatusActive: (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction) => boolean;
  isStatusDisabled: (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction) => boolean;
  ownerInitials: (requestItem: WithdrawalRequestItem) => string;
  paymentDetailDocumentExtension: (document: WithdrawalPaymentDetailDocument) => string;
  paymentDetailDocumentHref: (document: WithdrawalPaymentDetailDocument) => string;
  paymentDetailEntries: (requestItem: WithdrawalRequestItem) => WithdrawalPaymentDetailEntry[];
  shortId: (value: string) => string;
  statusClass: (value: string) => string;
  statusText: (value: string) => string;
  successfulActionTitle: (requestItem: WithdrawalRequestItem) => string;
  transferRouteValue: (requestItem: WithdrawalRequestItem) => string;
};

export type WithdrawalRequestCardEmits = {
  "edit-input": [key: "amount", value: string];
  "edit-select-change": [key: "accountId" | "paymentDetailId", value: string | null];
  "edit-textarea": [key: "comment" | "adminComment", event: Event];
  "notify-client-change": [requestId: string, value: boolean];
  "quick-status-update": [requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction];
  "request-status-change": [requestItem: WithdrawalRequestItem];
  "save-edit": [requestItem: WithdrawalRequestItem];
  "toggle-edit": [requestItem: WithdrawalRequestItem];
  "toggle-payment-detail": [requestId: string];
};

export type WithdrawalRequestCardEmit = {
  (event: "edit-input", key: "amount", value: string): void;
  (event: "edit-select-change", key: "accountId" | "paymentDetailId", value: string | null): void;
  (event: "edit-textarea", key: "comment" | "adminComment", eventValue: Event): void;
  (event: "notify-client-change", requestId: string, value: boolean): void;
  (event: "quick-status-update", requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): void;
  (event: "request-status-change", requestItem: WithdrawalRequestItem): void;
  (event: "save-edit", requestItem: WithdrawalRequestItem): void;
  (event: "toggle-edit", requestItem: WithdrawalRequestItem): void;
  (event: "toggle-payment-detail", requestId: string): void;
};

export const WITHDRAWAL_REQUEST_CARD_CLASS =
  "flex flex-col gap-3.5 rounded-[14px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] px-3.5 py-3.5 text-[var(--ui-text-main)]";

export const WITHDRAWAL_STATUS_BADGE_BASE_CLASS =
  "inline-flex min-h-[26px] items-center justify-center rounded-full px-2.5 text-[11px] font-bold";

export const WITHDRAWAL_STATUS_BADGE_CLASS_MAP: Record<string, string> = {
  "is-pending": "bg-[color-mix(in_srgb,var(--color-warning)_16%,transparent)] text-[var(--color-warning)]",
  "is-processing": "bg-[color-mix(in_srgb,var(--color-info)_16%,transparent)] text-[var(--color-info)]",
  "is-success": "bg-[color-mix(in_srgb,var(--color-success)_16%,transparent)] text-[var(--color-success)]",
  "is-failed": "bg-[color-mix(in_srgb,var(--color-danger)_16%,transparent)] text-[var(--color-danger)]",
  "is-cancelled": "bg-[color-mix(in_srgb,var(--color-danger)_16%,transparent)] text-[var(--color-danger)]",
};

export const WITHDRAWAL_STATUS_ACTION_BASE_CLASS =
  "inline-flex h-8 w-8 items-center justify-center rounded-[9px] border border-transparent bg-transparent transition duration-200 hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-45";

export const WITHDRAWAL_STATUS_ACTION_SUCCESS_CLASS =
  "hover:border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-success)_22%,transparent)]";

export const WITHDRAWAL_STATUS_ACTION_SUCCESS_ACTIVE_CLASS =
  "border-[color-mix(in_srgb,var(--color-success)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_22%,transparent)]";

export const WITHDRAWAL_STATUS_ACTION_DANGER_CLASS =
  "hover:border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] hover:bg-[color-mix(in_srgb,var(--color-danger)_22%,transparent)]";

export const WITHDRAWAL_STATUS_ACTION_DANGER_ACTIVE_CLASS =
  "border-[color-mix(in_srgb,var(--color-danger)_40%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_22%,transparent)]";

export const WITHDRAWAL_AVATAR_CLASS =
  "relative inline-flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background)] text-[13px] font-[820] uppercase text-[var(--ui-text-main)]";
