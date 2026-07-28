import { computed } from "vue";

import {
  WITHDRAWAL_ROWS_PER_PAGE_OPTIONS,
  type WithdrawalPaginatorEvent,
  type WithdrawalRequestItem,
  type WithdrawalStatusAction,
} from "~/composables/admin/withdrawal-requests";
import type { WithdrawalRequestsPanelEmit, WithdrawalRequestsPanelProps } from "./index";

export function useWithdrawalRequestsPanelSetup(
  props: WithdrawalRequestsPanelProps,
  emit: WithdrawalRequestsPanelEmit
) {
  const isRefreshing = computed(() => props.isLoading || props.isStatsLoading);
  const paginatorFirst = computed(() => (props.page - 1) * props.perPage);
  const showLoadingOverlay = computed(() => props.isLoading && props.requests.length > 0);
  const showError = computed(() => props.errorMessage !== "");
  const showInitialLoading = computed(() => props.isLoading && props.requests.length === 0);
  const showEmpty = computed(() => !props.isLoading && props.requests.length === 0);
  const showRequests = computed(() => !showError.value && !showInitialLoading.value && !showEmpty.value);
  const showPaginator = computed(() => showRequests.value && props.totalRows > props.perPage);

  const accountOptionsFor = (requestItem: WithdrawalRequestItem) =>
    props.accountOptionsByUserId[requestItem.user_id] || [];

  const paymentDetailOptionsFor = (requestItem: WithdrawalRequestItem) =>
    props.paymentDetailOptionsByUserId[requestItem.user_id] || [];

  const shouldNotifyClient = (requestId: string): boolean => props.notifyClientByRequestId[requestId] !== false;

  const handleFilter = (status: string): void => {
    emit("filter", status);
  };

  const handleSearch = (value: string): void => {
    emit("search", value);
  };

  const handleRefresh = (): void => {
    emit("refresh");
  };

  const handlePaginatorPage = (event: WithdrawalPaginatorEvent): void => {
    emit("page", event);
  };

  const handleToggleEdit = (requestItem: WithdrawalRequestItem): void => {
    emit("toggle-edit", requestItem);
  };

  const handleQuickStatusUpdate = (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): void => {
    emit("quick-status-update", requestItem, nextStatus);
  };

  const handleRequestStatusChange = (requestItem: WithdrawalRequestItem): void => {
    emit("request-status-change", requestItem);
  };

  const handleEditSelectChange = (key: "accountId" | "paymentDetailId", value: string | null): void => {
    emit("edit-select-change", key, value);
  };

  const handleEditInput = (key: "amount", value: string): void => {
    emit("edit-input", key, value);
  };

  const handleEditTextarea = (key: "comment" | "adminComment", event: Event): void => {
    emit("edit-textarea", key, event);
  };

  const handleSaveEdit = (requestItem: WithdrawalRequestItem): void => {
    emit("save-edit", requestItem);
  };

  const handleTogglePaymentDetail = (requestId: string): void => {
    emit("toggle-payment-detail", requestId);
  };

  const handleNotifyClientChange = (requestId: string, value: boolean): void => {
    emit("notify-client-change", requestId, value);
  };

  return {
    accountOptionsFor,
    handleEditInput,
    handleEditSelectChange,
    handleEditTextarea,
    handleFilter,
    handleNotifyClientChange,
    handlePaginatorPage,
    handleQuickStatusUpdate,
    handleRequestStatusChange,
    handleRefresh,
    handleSaveEdit,
    handleSearch,
    handleToggleEdit,
    handleTogglePaymentDetail,
    isRefreshing,
    paginatorFirst,
    paymentDetailOptionsFor,
    rowsPerPageOptions: WITHDRAWAL_ROWS_PER_PAGE_OPTIONS,
    shouldNotifyClient,
    showEmpty,
    showError,
    showInitialLoading,
    showLoadingOverlay,
    showPaginator,
    showRequests,
  };
}
