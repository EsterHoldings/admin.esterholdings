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
        :payment-primary-fields="paymentPrimaryFields"
        :format-date-time="formatDateTime"
        :status-text="statusText"
        :status-class="statusClass"
        :document-label="documentLabel"
        :open-document="openDocument" />
    </section>

    <PrimePaginator
      v-if="showPaginator"
      class="!justify-start !border-0 !bg-transparent !px-0 !pb-0 !pt-2.5"
      :first="paginatorFirst"
      :rows="perPage"
      :total-records="paymentDetails.length"
      :rows-per-page-options="rowsPerPageOptions"
      @page="handlePaginatorPage" />
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
    documentLabel,
    formatDateTime,
    handlePaginatorPage,
    isLoading,
    labels,
    loadPaymentDetails,
    openDocument,
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
    statusText,
    summaryCards,
  } = useTabPaymentDetailsSetup(props);
</script>
