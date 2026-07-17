<template>
  <div class="flex flex-col gap-3 p-3.5 max-[640px]:p-3">
    <PaymentDetailsSummaryGrid :cards="summaryCards" />

    <PaymentDetailsToolbar
      v-model:archive-filter="archiveFilter"
      :archive-filter-options="archiveFilterOptions"
      :is-loading="isLoading"
      :refresh-label="labels.refresh"
      @refresh="loadPaymentDetails" />

    <div
      v-if="showSkeleton"
      class="grid gap-2.5">
      <PrimeSkeleton
        v-for="row in skeletonRows"
        :key="`payment-detail-skeleton-${row}`"
        height="116px"
        border-radius="20px" />
    </div>

    <PaymentDetailsEmptyState
      v-else-if="showEmpty"
      :title="labels.emptyTitle"
      :subtitle="labels.emptySubtitle" />

    <section
      v-else
      class="grid gap-2.5">
      <PaymentDetailsCard
        v-for="paymentDetail in pagedPaymentDetails"
        :key="paymentDetail.id"
        :payment-detail="paymentDetail"
        :updated-at-label="labels.updatedAt"
        :document-alt-label="labels.documentAlt"
        :admin-comment-label="labels.adminComment"
        :change-status-label="labels.changeStatus"
        :approve-label="labels.approve"
        :reject-label="labels.reject"
        :cancel-label="labels.cancel"
        :show-change-status="canModeratePaymentDetail(paymentDetail) && !isStatusEditing(paymentDetail)"
        :show-status-actions="canModeratePaymentDetail(paymentDetail) && isStatusEditing(paymentDetail)"
        :show-cancel-status-edit="paymentDetail.status !== 'pending'"
        :is-updating-status="isPaymentDetailStatusUpdating(paymentDetail.id)"
        :payment-primary-fields="paymentPrimaryFields"
        :format-date-time="formatDateTime"
        :status-text="statusText"
        :status-class="statusClass"
        :document-label="documentLabel"
        :open-document="openDocument"
        @start-status-edit="startStatusEditing(paymentDetail.id)"
        @cancel-status-edit="cancelStatusEditing(paymentDetail.id)"
        @change-status="status => openStatusDecisionDialog(paymentDetail, status)" />
    </section>

    <PrimePaginator
      v-if="showPaginator"
      class="!justify-start !border-0 !bg-transparent !px-0 !pb-0 !pt-2.5"
      :first="paginatorFirst"
      :rows="perPage"
      :total-records="paymentDetails.length"
      :rows-per-page-options="rowsPerPageOptions"
      @page="handlePaginatorPage" />

    <PrimeDialog
      v-model:visible="statusDecisionDialog.visible"
      modal
      :draggable="false"
      :closable="!isPaymentDetailStatusUpdating(statusDecisionDialog.paymentDetail?.id || '')"
      :dismissable-mask="!isPaymentDetailStatusUpdating(statusDecisionDialog.paymentDetail?.id || '')"
      class="w-[min(520px,calc(100vw-24px))]"
      :header="statusDecisionDialogTitle">
      <div class="grid gap-4">
        <p class="m-0 text-sm leading-relaxed text-[var(--ui-text-secondary)]">
          {{ statusDecisionDialogMessage }}
        </p>

        <label
          v-if="statusDecisionDialog.status === 'rejected'"
          class="grid gap-2 text-sm font-bold text-[var(--ui-text-main)]">
          <span>{{ labels.comment }}</span>
          <textarea
            v-model="statusDecisionDialog.comment"
            rows="4"
            class="w-full resize-y rounded-[14px] border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-card)] px-3 py-2.5 text-sm font-medium text-[var(--ui-text-main)] outline-none transition focus:border-[var(--ui-primary-main)]"
            :placeholder="labels.commentPlaceholder"
            :disabled="isPaymentDetailStatusUpdating(statusDecisionDialog.paymentDetail?.id || '')" />
        </label>
      </div>

      <template #footer>
        <div class="flex flex-wrap justify-end gap-2">
          <PrimeButton
            severity="secondary"
            text
            :label="labels.cancel"
            :disabled="isPaymentDetailStatusUpdating(statusDecisionDialog.paymentDetail?.id || '')"
            @click="closeStatusDecisionDialog" />
          <PrimeButton
            :severity="statusDecisionDialog.status === 'approved' ? 'success' : 'danger'"
            :icon="statusDecisionDialog.status === 'approved' ? 'pi pi-check' : 'pi pi-times'"
            :label="statusDecisionDialog.status === 'approved' ? labels.approve : labels.reject"
            :loading="isPaymentDetailStatusUpdating(statusDecisionDialog.paymentDetail?.id || '')"
            @click="confirmStatusDecision" />
        </div>
      </template>
    </PrimeDialog>
  </div>
</template>

<script setup lang="ts">
  import type { TabPaymentDetailsProps } from "~/composables/admin/clients/components/TabPaymentDetails";
  import { useTabPaymentDetailsSetup } from "~/composables/admin/clients/components/TabPaymentDetails/setup";
  import PaymentDetailsCard from "~/pages/admin/clients/[id]/components/payment-details/PaymentDetailsCard.vue";
  import PaymentDetailsEmptyState from "~/pages/admin/clients/[id]/components/payment-details/PaymentDetailsEmptyState.vue";
  import PaymentDetailsSummaryGrid from "~/pages/admin/clients/[id]/components/payment-details/PaymentDetailsSummaryGrid.vue";
  import PaymentDetailsToolbar from "~/pages/admin/clients/[id]/components/payment-details/PaymentDetailsToolbar.vue";

  const props = defineProps<TabPaymentDetailsProps>();

  const {
    archiveFilter,
    archiveFilterOptions,
    canModeratePaymentDetail,
    cancelStatusEditing,
    closeStatusDecisionDialog,
    confirmStatusDecision,
    documentLabel,
    formatDateTime,
    handlePaginatorPage,
    isLoading,
    isPaymentDetailStatusUpdating,
    isStatusEditing,
    labels,
    loadPaymentDetails,
    openDocument,
    openStatusDecisionDialog,
    pagedPaymentDetails,
    paginatorFirst,
    paymentDetails,
    paymentPrimaryFields,
    perPage,
    rowsPerPageOptions,
    showEmpty,
    showPaginator,
    showSkeleton,
    skeletonRows,
    statusClass,
    statusDecisionDialog,
    statusDecisionDialogMessage,
    statusDecisionDialogTitle,
    startStatusEditing,
    statusText,
    summaryCards,
  } = useTabPaymentDetailsSetup(props);
</script>
