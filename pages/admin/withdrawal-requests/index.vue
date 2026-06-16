<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ titleText }}</UiTextH4>
        <UiTextParagraph>{{ subtitleText }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-[18px] text-[var(--ui-text-main)]">
        <WithdrawalStatsGrid
          :cards="statCards"
          @filter="handleStatCardClick" />

        <WithdrawalToolbar
          :search-filter="searchFilter"
          :search-placeholder="searchPlaceholder"
          :is-refreshing="isLoading || isStatsLoading"
          @search="handleSearchInput"
          @refresh="refreshAll" />

        <div
          v-if="statusFilter"
          class="flex flex-wrap items-center gap-2.5 rounded-[14px] border border-[color-mix(in_srgb,var(--ui-primary-main)_24%,transparent)] bg-[color-mix(in_srgb,var(--ui-primary-main)_8%,transparent)] px-3.5 py-3 text-[var(--ui-text-secondary)]">
          <span>{{ statusFilterNoteText }}: {{ statusText(statusFilter) }}</span>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-2.5 py-1.5 text-[var(--ui-text-main)] transition hover:border-[color-mix(in_srgb,var(--ui-primary-main)_36%,transparent)] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_12%,transparent)]"
            @click="handleStatCardClick('')">
            {{ resetFilterText }}
          </button>
        </div>

        <div
          v-if="errorMessage"
          class="flex min-h-[180px] items-center justify-center rounded-2xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-center text-[var(--ui-sticker-danger)]">
          {{ errorMessage }}
        </div>

        <div
          v-if="isLoading && requests.length === 0"
          class="flex min-h-[180px] items-center justify-center rounded-2xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-center">
          <UiIconSpinnerDefault />
        </div>

        <div
          v-else-if="requests.length === 0"
          class="flex min-h-[180px] items-center justify-center rounded-2xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-center">
          {{ emptyText }}
        </div>

        <div
          v-else
          class="relative flex flex-col gap-3">
          <div
            v-if="isLoading"
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
              :notify-client="notifyClientByRequestId[requestItem.id] !== false"
              :edit-form="editForm"
              :edit-errors="editErrors"
              :account-options="accountOptionsByUserId[requestItem.user_id] || []"
              :payment-detail-options="paymentDetailOptionsByUserId[requestItem.user_id] || []"
              :can-edit-request="canEditRequest"
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
              @edit-select-change="handleEditSelectChange"
              @edit-input="handleEditInput"
              @edit-textarea="handleEditTextarea"
              @save-edit="handleSaveEdit"
              @toggle-payment-detail="togglePaymentDetailExpanded"
              @notify-client-change="handleNotifyClientChange" />
          </div>

          <PrimePaginator
            v-if="totalRows > perPage"
            class="self-stretch"
            :first="(page - 1) * perPage"
            :rows="perPage"
            :total-records="totalRows"
            :rows-per-page-options="WITHDRAWAL_ROWS_PER_PAGE_OPTIONS"
            @page="handlePaginatorPage" />
        </div>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import { WITHDRAWAL_ROWS_PER_PAGE_OPTIONS } from "~/composables/admin/withdrawal-requests";
  import { useWithdrawalRequestsPage } from "~/composables/admin/withdrawal-requests/useWithdrawalRequestsPage";
  import WithdrawalRequestCard from "./components/WithdrawalRequestCard.vue";
  import WithdrawalStatsGrid from "./components/WithdrawalStatsGrid.vue";
  import WithdrawalToolbar from "./components/WithdrawalToolbar.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const {
    accountOptionsByUserId,
    auxiliaryLoadingUserId,
    canEditRequest,
    canManagePayments,
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
    resetFilterText,
    searchFilter,
    searchPlaceholder,
    shortId,
    statCards,
    statusClass,
    statusFilter,
    statusFilterNoteText,
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
