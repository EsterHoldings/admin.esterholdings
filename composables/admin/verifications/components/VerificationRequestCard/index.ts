import type {
  RequestReviewState,
  RequestStateFilter,
  ReviewFocusItem,
  VerificationRequestItem,
  VerificationRequestNextState,
  VerificationSectionTarget,
  VerificationTabTarget,
} from "~/composables/admin/verifications/types";

export type VerificationRequestCardProps = {
  requestItem: VerificationRequestItem;
  noChangesLabel: string;
  approveLabel: string;
  rejectLabel: string;
  displayClientName: (requestItem: VerificationRequestItem) => string;
  displayClientInitials: (requestItem: VerificationRequestItem) => string;
  shortId: (value: string) => string;
  formatUpdatedAt: (requestItem: VerificationRequestItem) => string;
  requestStateText: (state: RequestStateFilter | RequestReviewState) => string;
  requestFocusItems: (requestItem: VerificationRequestItem) => ReviewFocusItem[];
  hasUnreadVerificationSignal: (userId: string, section?: VerificationSectionTarget) => boolean;
  isUpdating: (requestId: string, state?: RequestReviewState) => boolean;
};

export type VerificationRequestCardEmits = {
  open: [requestItem: VerificationRequestItem, tab?: VerificationTabTarget, section?: VerificationSectionTarget | null];
  review: [requestItem: VerificationRequestItem, nextState: VerificationRequestNextState];
};

export type VerificationRequestCardEmit = {
  (
    event: "open",
    requestItem: VerificationRequestItem,
    tab?: VerificationTabTarget,
    section?: VerificationSectionTarget | null
  ): void;
  (event: "review", requestItem: VerificationRequestItem, nextState: VerificationRequestNextState): void;
};

export const VERIFICATION_REQUEST_CARD_BASE_CLASS =
  "relative grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-start gap-[18px] border-b border-[var(--color-stroke-ui-light)] bg-transparent py-[18px] transition duration-200 hover:border-[color-mix(in_srgb,var(--ui-primary-main)_26%,var(--color-stroke-ui-light))] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_4%,transparent)] max-[1180px]:grid-cols-1";

export const VERIFICATION_REQUEST_CARD_PENDING_CLASS =
  "border-[color-mix(in_srgb,var(--color-warning)_28%,var(--color-stroke-ui-light))]";

export const VERIFICATION_REQUEST_CARD_UNREAD_CLASS = "bg-[color-mix(in_srgb,var(--ui-primary-main)_6%,transparent)]";

export const VERIFICATION_CHANGE_CHIP_BASE_CLASS =
  "inline-flex min-h-[30px] items-center gap-[7px] rounded-full border border-[var(--color-stroke-ui-light)] bg-[color-mix(in_srgb,var(--ui-background-panel)_86%,transparent)] px-2.5 py-1.5 text-xs font-bold text-[var(--ui-text-main)] transition duration-200 hover:-translate-y-px hover:border-[var(--ui-primary-main)] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_12%,var(--ui-background-panel))]";

export const VERIFICATION_CHANGE_CHIP_UNREAD_CLASS =
  "border-[var(--ui-primary-main)] shadow-[0_0_0_1px_color-mix(in_srgb,var(--ui-primary-main)_20%,transparent)]";

export const VERIFICATION_STATUS_TEXT_CLASS_MAP: Record<RequestReviewState, string> = {
  approved: "text-[var(--color-success)]",
  pending: "text-[var(--color-warning)]",
  rejected: "text-[var(--color-danger)]",
};
