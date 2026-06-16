import type {
  RequestReviewState,
  RequestStateFilter,
  ReviewFocusItem,
  VerificationPanelLabels,
  VerificationPaginatorEvent,
  VerificationRequestItem,
  VerificationRequestNextState,
  VerificationSectionTarget,
  VerificationStatCard,
  VerificationTabTarget,
} from "~/composables/admin/verifications/types";

export type VerificationsPanelProps = {
  statCards: VerificationStatCard[];
  requestStateFilter: RequestStateFilter;
  searchInput: string;
  isLoading: boolean;
  errorMessage: string;
  requestItems: VerificationRequestItem[];
  totalRows: number;
  page: number;
  perPage: number;
  requestReviewDialogVisible: boolean;
  requestReviewDialogSubmitting: boolean;
  requestReviewSendNotifications: boolean;
  requestReviewDialogNextState: VerificationRequestNextState | null;
  requestReviewDialogTitle: string;
  requestReviewDialogMessage: string;
  labels: VerificationPanelLabels;
  displayClientName: (requestItem: VerificationRequestItem) => string;
  displayClientInitials: (requestItem: VerificationRequestItem) => string;
  shortId: (value: string) => string;
  formatUpdatedAt: (requestItem: VerificationRequestItem) => string;
  requestStateText: (state: RequestStateFilter | RequestReviewState) => string;
  requestFocusItems: (requestItem: VerificationRequestItem) => ReviewFocusItem[];
  hasUnreadVerificationSignal: (userId: string, section?: VerificationSectionTarget) => boolean;
  isUpdating: (requestId: string, state?: RequestReviewState) => boolean;
};

export type VerificationsPanelEmits = {
  "update:searchInput": [value: string];
  "update:requestReviewSendNotifications": [value: boolean];
  filter: [value: RequestStateFilter];
  refresh: [];
  retry: [];
  page: [event: VerificationPaginatorEvent];
  openClientVerification: [
    requestItem: VerificationRequestItem,
    tab?: VerificationTabTarget,
    section?: VerificationSectionTarget | null,
  ];
  openRequestReviewConfirm: [requestItem: VerificationRequestItem, nextState: VerificationRequestNextState];
  closeRequestReviewDialog: [];
  confirmRequestReviewUpdate: [];
};

export type VerificationsPanelEmit = {
  (event: "update:searchInput", value: string): void;
  (event: "update:requestReviewSendNotifications", value: boolean): void;
  (event: "filter", value: RequestStateFilter): void;
  (event: "refresh"): void;
  (event: "retry"): void;
  (event: "page", value: VerificationPaginatorEvent): void;
  (
    event: "openClientVerification",
    requestItem: VerificationRequestItem,
    tab?: VerificationTabTarget,
    section?: VerificationSectionTarget | null
  ): void;
  (
    event: "openRequestReviewConfirm",
    requestItem: VerificationRequestItem,
    nextState: VerificationRequestNextState
  ): void;
  (event: "closeRequestReviewDialog"): void;
  (event: "confirmRequestReviewUpdate"): void;
};

export const VERIFICATION_PANEL_ROWS_PER_PAGE_OPTIONS = [5, 10, 20, 50];
export const VERIFICATION_PANEL_SKELETON_ROWS = [1, 2, 3, 4, 5];
