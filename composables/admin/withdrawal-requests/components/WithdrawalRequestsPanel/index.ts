import type {
  WithdrawalEditErrors,
  WithdrawalEditForm,
  WithdrawalPaginatorEvent,
  WithdrawalPaymentDetailDocument,
  WithdrawalPaymentDetailEntry,
  WithdrawalRequestItem,
  WithdrawalRequestLabels,
  WithdrawalSelectOption,
  WithdrawalStatCard,
  WithdrawalStatusAction,
} from "~/composables/admin/withdrawal-requests";

export type WithdrawalRequestsPanelProps = {
  statCards: WithdrawalStatCard[];
  searchFilter: string;
  searchPlaceholder: string;
  emptyText: string;
  isLoading: boolean;
  isStatsLoading: boolean;
  errorMessage: string;
  requests: WithdrawalRequestItem[];
  totalRows: number;
  page: number;
  perPage: number;
  labels: WithdrawalRequestLabels;
  canManagePayments: boolean;
  editingRequestId: string;
  updatingRequestId: string;
  auxiliaryLoadingUserId: string;
  notifyClientByRequestId: Record<string, boolean>;
  editForm: WithdrawalEditForm;
  editErrors: WithdrawalEditErrors;
  accountOptionsByUserId: Record<string, WithdrawalSelectOption[]>;
  paymentDetailOptionsByUserId: Record<string, WithdrawalSelectOption[]>;
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

export type WithdrawalRequestsPanelEmits = {
  filter: [status: string];
  search: [value: string];
  refresh: [];
  page: [event: WithdrawalPaginatorEvent];
  "toggle-edit": [requestItem: WithdrawalRequestItem];
  "quick-status-update": [requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction];
  "request-status-change": [requestItem: WithdrawalRequestItem];
  "edit-select-change": [key: "accountId" | "paymentDetailId", value: string | null];
  "edit-input": [key: "amount", value: string];
  "edit-textarea": [key: "comment" | "adminComment", event: Event];
  "save-edit": [requestItem: WithdrawalRequestItem];
  "toggle-payment-detail": [requestId: string];
  "notify-client-change": [requestId: string, value: boolean];
};

export type WithdrawalRequestsPanelEmit = {
  (event: "filter", status: string): void;
  (event: "search", value: string): void;
  (event: "refresh"): void;
  (event: "page", value: WithdrawalPaginatorEvent): void;
  (event: "toggle-edit", requestItem: WithdrawalRequestItem): void;
  (event: "quick-status-update", requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): void;
  (event: "request-status-change", requestItem: WithdrawalRequestItem): void;
  (event: "edit-select-change", key: "accountId" | "paymentDetailId", value: string | null): void;
  (event: "edit-input", key: "amount", value: string): void;
  (event: "edit-textarea", key: "comment" | "adminComment", eventValue: Event): void;
  (event: "save-edit", requestItem: WithdrawalRequestItem): void;
  (event: "toggle-payment-detail", requestId: string): void;
  (event: "notify-client-change", requestId: string, value: boolean): void;
};
