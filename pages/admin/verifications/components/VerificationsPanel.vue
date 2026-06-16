<template>
  <div class="flex w-full flex-col gap-[18px]">
    <VerificationStatFilters
      :cards="statCards"
      :active-filter="requestStateFilter"
      :ariaLabel="labels.statsAriaLabel"
      @filter="handleFilter" />

    <VerificationToolbar
      :search-input="searchInput"
      :placeholder="labels.searchPlaceholder"
      :refresh-aria-label="labels.refreshAriaLabel"
      :is-loading="isLoading"
      @update:search-input="handleSearchInput"
      @refresh="handleRefresh" />

    <div
      v-if="showLoadingLine"
      class="h-0.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--ui-primary-main)_12%,transparent)]"
      aria-hidden="true">
      <div class="h-full w-1/3 animate-pulse rounded-full bg-[var(--ui-primary-main)]" />
    </div>

    <VerificationStateMessage
      v-if="showError"
      :message="errorMessage"
      :retry-label="labels.retryLabel"
      is-error
      @retry="handleRetry" />

    <VerificationSkeletonList
      v-else-if="showSkeleton"
      :rows="skeletonRows" />

    <VerificationStateMessage
      v-else-if="showEmpty"
      :message="labels.emptyList" />

    <section
      v-else
      class="flex flex-col">
      <VerificationRequestCard
        v-for="requestItem in requestItems"
        :key="requestItem.id"
        :request-item="requestItem"
        :no-changes-label="labels.noActiveChanges"
        :approve-label="labels.approveAll"
        :reject-label="labels.rejectAll"
        :display-client-name="displayClientName"
        :display-client-initials="displayClientInitials"
        :short-id="shortId"
        :format-updated-at="formatUpdatedAt"
        :request-state-text="requestStateText"
        :request-focus-items="requestFocusItems"
        :has-unread-verification-signal="hasUnreadVerificationSignal"
        :is-updating="isUpdating"
        @open="handleOpenClientVerification"
        @review="handleOpenRequestReviewConfirm" />
    </section>

    <PrimePaginator
      v-if="showPaginator"
      class="!justify-start !border-0 !bg-transparent !px-0 !pb-0 !pt-2.5"
      :first="paginatorFirst"
      :rows="perPage"
      :total-records="totalRows"
      :rows-per-page-options="rowsPerPageOptions"
      @page="handlePaginatorPage" />

    <VerificationReviewDialog
      :visible="requestReviewDialogVisible"
      :submitting="requestReviewDialogSubmitting"
      :send-notifications="requestReviewSendNotifications"
      :next-state="requestReviewDialogNextState"
      :title="requestReviewDialogTitle"
      :message="requestReviewDialogMessage"
      :approve-label="labels.approveAll"
      :reject-label="labels.rejectAll"
      :cancel-label="labels.cancel"
      :send-notifications-label="labels.sendNotifications"
      @update:send-notifications="handleRequestReviewSendNotifications"
      @close="handleCloseRequestReviewDialog"
      @confirm="handleConfirmRequestReviewUpdate" />
  </div>
</template>

<script setup lang="ts">
  import type {
    VerificationsPanelEmits,
    VerificationsPanelProps,
  } from "~/composables/admin/verifications/components/VerificationsPanel";
  import { useVerificationsPanelSetup } from "~/composables/admin/verifications/components/VerificationsPanel/setup";
  import VerificationRequestCard from "~/pages/admin/verifications/components/VerificationRequestCard.vue";
  import VerificationReviewDialog from "~/pages/admin/verifications/components/VerificationReviewDialog.vue";
  import VerificationSkeletonList from "~/pages/admin/verifications/components/VerificationSkeletonList.vue";
  import VerificationStatFilters from "~/pages/admin/verifications/components/VerificationStatFilters.vue";
  import VerificationStateMessage from "~/pages/admin/verifications/components/VerificationStateMessage.vue";
  import VerificationToolbar from "~/pages/admin/verifications/components/VerificationToolbar.vue";

  const props = defineProps<VerificationsPanelProps>();
  const emit = defineEmits<VerificationsPanelEmits>();

  const {
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
    rowsPerPageOptions,
    showEmpty,
    showError,
    showLoadingLine,
    showPaginator,
    showSkeleton,
    skeletonRows,
  } = useVerificationsPanelSetup(props, emit);
</script>
