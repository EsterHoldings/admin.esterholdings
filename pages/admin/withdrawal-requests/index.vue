<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ titleText }}</UiTextH4>
        <UiTextParagraph>{{ subtitleText }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <PageStructureContent plain>
        <template #content>
          <WithdrawalRequestsPanel
            :stat-cards="statCards"
            :search-filter="searchFilter"
            :search-placeholder="searchPlaceholder"
            :empty-text="emptyText"
            :is-loading="isLoading"
            :is-stats-loading="isStatsLoading"
            :error-message="errorMessage"
            :requests="requests"
            :total-rows="totalRows"
            :page="page"
            :per-page="perPage"
            :labels="labels"
            :can-manage-payments="canManagePayments"
            :editing-request-id="editingRequestId"
            :updating-request-id="updatingRequestId"
            :auxiliary-loading-user-id="auxiliaryLoadingUserId"
            :notify-client-by-request-id="notifyClientByRequestId"
            :edit-form="editForm"
            :edit-errors="editErrors"
            :account-options-by-user-id="accountOptionsByUserId"
            :payment-detail-options-by-user-id="paymentDetailOptionsByUserId"
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
            @filter="handleStatCardClick"
            @search="handleSearchInput"
            @refresh="refreshAll"
            @page="handlePaginatorPage"
            @toggle-edit="handleToggleEdit"
            @quick-status-update="handleQuickStatusUpdate"
            @request-status-change="handleRequestStatusChange"
            @edit-select-change="handleEditSelectChange"
            @edit-input="handleEditInput"
            @edit-textarea="handleEditTextarea"
            @save-edit="handleSaveEdit"
            @toggle-payment-detail="togglePaymentDetailExpanded"
            @notify-client-change="handleNotifyClientChange" />
        </template>
      </PageStructureContent>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";

  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import { useWithdrawalRequestsPage } from "~/composables/admin/withdrawal-requests/useWithdrawalRequestsPage";
  import WithdrawalRequestsPanel from "./components/WithdrawalRequestsPanel.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const {
    accountOptionsByUserId,
    auxiliaryLoadingUserId,
    canEditRequest,
    canManagePayments,
    canRequestStatusChange,
    clientLink,
    editErrors,
    editForm,
    editingRequestId,
    emptyText,
    errorMessage,
    formatDateTime,
    formatMoney,
    handleEditInput,
    handleEditSelectChange,
    handleEditTextarea,
    handleNotifyClientChange,
    handlePaginatorPage,
    handleQuickStatusUpdate,
    handleRequestStatusChange,
    handleSaveEdit,
    handleSearchInput,
    handleStatCardClick,
    handleToggleEdit,
    hasPaymentDetailData,
    internalTransferExecutionText,
    isLoading,
    isPaymentDetailDocumentImage,
    isPaymentDetailExpanded,
    isStatsLoading,
    isStatusActive,
    isStatusDisabled,
    labels,
    notifyClientByRequestId,
    ownerInitials,
    page,
    paymentDetailDocumentExtension,
    paymentDetailDocumentHref,
    paymentDetailEntries,
    paymentDetailOptionsByUserId,
    perPage,
    refreshAll,
    requests,
    searchFilter,
    searchPlaceholder,
    shortId,
    statCards,
    statusClass,
    statusText,
    subtitleText,
    successfulActionTitle,
    titleText,
    togglePaymentDetailExpanded,
    totalRows,
    transferRouteValue,
    updatingRequestId,
  } = useWithdrawalRequestsPage();

  defineExpose({
    reload: refreshAll,
  });
</script>
