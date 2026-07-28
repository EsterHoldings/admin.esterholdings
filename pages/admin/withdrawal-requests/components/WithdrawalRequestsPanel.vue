<template>
  <div class="flex flex-col gap-[18px] text-[var(--ui-text-main)]">
    <WithdrawalStatsGrid
      :cards="statCards"
      @filter="handleFilter" />

    <WithdrawalToolbar
      :search-filter="searchFilter"
      :search-placeholder="searchPlaceholder"
      :is-refreshing="isRefreshing"
      @search="handleSearch"
      @refresh="handleRefresh" />

    <WithdrawalStateBlock
      v-if="showError"
      :message="errorMessage"
      is-error />

    <WithdrawalStateBlock
      v-else-if="showInitialLoading"
      is-loading />

    <WithdrawalStateBlock
      v-else-if="showEmpty"
      :message="emptyText" />

    <section
      v-else-if="showRequests"
      class="relative flex flex-col gap-3">
      <div
        v-if="showLoadingOverlay"
        class="absolute inset-0 z-[4] flex items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--ui-background)_48%,transparent)] backdrop-blur">
        <UiIconSpinnerDefault />
      </div>

      <div class="flex flex-col gap-2.5">
        <WithdrawalRequestCard
          v-for="requestItem in requests"
          :key="requestItem.id"
          :request-item="requestItem"
          :labels="labels"
          :can-manage-payments="canManagePayments"
          :editing-request-id="editingRequestId"
          :updating-request-id="updatingRequestId"
          :auxiliary-loading-user-id="auxiliaryLoadingUserId"
          :notify-client="shouldNotifyClient(requestItem.id)"
          :edit-form="editForm"
          :edit-errors="editErrors"
          :account-options="accountOptionsFor(requestItem)"
          :payment-detail-options="paymentDetailOptionsFor(requestItem)"
          :can-edit-request="canEditRequest"
          :can-request-status-change="canRequestStatusChange"
          :client-link="clientLink"
          :format-date-time="formatDateTime"
          :format-money="formatMoney"
          :has-payment-detail-data="hasPaymentDetailData"
          :internal-transfer-execution-text="internalTransferExecutionText"
          :is-payment-detail-document-image="isPaymentDetailDocumentImage"
          :is-payment-detail-expanded="isPaymentDetailExpanded"
          :is-status-active="isStatusActive"
          :is-status-disabled="isStatusDisabled"
          :owner-initials="ownerInitials"
          :payment-detail-document-extension="paymentDetailDocumentExtension"
          :payment-detail-document-href="paymentDetailDocumentHref"
          :payment-detail-entries="paymentDetailEntries"
          :short-id="shortId"
          :status-class="statusClass"
          :status-text="statusText"
          :successful-action-title="successfulActionTitle"
          :transfer-route-value="transferRouteValue"
          @toggle-edit="handleToggleEdit"
          @quick-status-update="handleQuickStatusUpdate"
          @request-status-change="handleRequestStatusChange"
          @edit-select-change="handleEditSelectChange"
          @edit-input="handleEditInput"
          @edit-textarea="handleEditTextarea"
          @save-edit="handleSaveEdit"
          @toggle-payment-detail="handleTogglePaymentDetail"
          @notify-client-change="handleNotifyClientChange" />
      </div>

      <PrimePaginator
        v-if="showPaginator"
        class="self-stretch"
        :first="paginatorFirst"
        :rows="perPage"
        :total-records="totalRows"
        :rows-per-page-options="rowsPerPageOptions"
        @page="handlePaginatorPage" />
    </section>
  </div>
</template>

<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import type {
    WithdrawalRequestsPanelEmits,
    WithdrawalRequestsPanelProps,
  } from "~/composables/admin/withdrawal-requests/components/WithdrawalRequestsPanel";
  import { useWithdrawalRequestsPanelSetup } from "~/composables/admin/withdrawal-requests/components/WithdrawalRequestsPanel/setup";
  import WithdrawalRequestCard from "~/pages/admin/withdrawal-requests/components/WithdrawalRequestCard.vue";
  import WithdrawalStateBlock from "~/pages/admin/withdrawal-requests/components/WithdrawalStateBlock.vue";
  import WithdrawalStatsGrid from "~/pages/admin/withdrawal-requests/components/WithdrawalStatsGrid.vue";
  import WithdrawalToolbar from "~/pages/admin/withdrawal-requests/components/WithdrawalToolbar.vue";

  const props = defineProps<WithdrawalRequestsPanelProps>();
  const emit = defineEmits<WithdrawalRequestsPanelEmits>();

  const {
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
    rowsPerPageOptions,
    shouldNotifyClient,
    showEmpty,
    showError,
    showInitialLoading,
    showLoadingOverlay,
    showPaginator,
    showRequests,
  } = useWithdrawalRequestsPanelSetup(props, emit);
</script>
