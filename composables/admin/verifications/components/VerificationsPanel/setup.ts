import { computed } from "vue";
import {
  VERIFICATION_PANEL_ROWS_PER_PAGE_OPTIONS,
  VERIFICATION_PANEL_SKELETON_ROWS,
  type VerificationsPanelEmit,
  type VerificationsPanelProps,
} from "./index";
import type {
  RequestStateFilter,
  VerificationPaginatorEvent,
  VerificationRequestItem,
  VerificationRequestNextState,
  VerificationSectionTarget,
  VerificationTabTarget,
} from "~/composables/admin/verifications/types";

export function useVerificationsPanelSetup(props: VerificationsPanelProps, emit: VerificationsPanelEmit) {
  const paginatorFirst = computed(() => (props.page - 1) * props.perPage);
  const showLoadingLine = computed(() => props.isLoading && props.requestItems.length > 0);
  const showError = computed(() => props.errorMessage !== "");
  const showSkeleton = computed(() => props.isLoading && props.requestItems.length === 0);
  const showEmpty = computed(() => props.requestItems.length === 0);
  const showPaginator = computed(() => props.totalRows > 0);

  function handleSearchInput(value: string): void {
    emit("update:searchInput", value);
  }

  function handleRequestReviewSendNotifications(value: boolean): void {
    emit("update:requestReviewSendNotifications", value);
  }

  function handleFilter(value: RequestStateFilter): void {
    emit("filter", value);
  }

  function handleRefresh(): void {
    emit("refresh");
  }

  function handleRetry(): void {
    emit("retry");
  }

  function handlePaginatorPage(event: VerificationPaginatorEvent): void {
    emit("page", event);
  }

  function handleOpenClientVerification(
    requestItem: VerificationRequestItem,
    tab?: VerificationTabTarget,
    section?: VerificationSectionTarget | null
  ): void {
    emit("openClientVerification", requestItem, tab, section);
  }

  function handleOpenRequestReviewConfirm(
    requestItem: VerificationRequestItem,
    nextState: VerificationRequestNextState
  ): void {
    emit("openRequestReviewConfirm", requestItem, nextState);
  }

  function handleCloseRequestReviewDialog(): void {
    emit("closeRequestReviewDialog");
  }

  function handleConfirmRequestReviewUpdate(): void {
    emit("confirmRequestReviewUpdate");
  }

  return {
    handleCloseRequestReviewDialog,
    handleConfirmRequestReviewUpdate,
    handleFilter,
    handleOpenClientVerification,
    handleOpenRequestReviewConfirm,
    handlePaginatorPage,
    handleRefresh,
    handleRequestReviewSendNotifications,
    handleRetry,
    handleSearchInput,
    paginatorFirst,
    rowsPerPageOptions: VERIFICATION_PANEL_ROWS_PER_PAGE_OPTIONS,
    showEmpty,
    showError,
    showLoadingLine,
    showPaginator,
    showSkeleton,
    skeletonRows: VERIFICATION_PANEL_SKELETON_ROWS,
  };
}
