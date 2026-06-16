<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ pageTitle }}</UiTextH4>
      </div>
    </template>

    <template #content>
      <PageStructureContent plain>
        <template #content>
          <VerificationsPanel
            v-model:search-input="searchInput"
            v-model:request-review-send-notifications="requestReviewSendNotifications"
            :stat-cards="statCards"
            :request-state-filter="requestStateFilter"
            :is-loading="isLoading"
            :error-message="errorMessage"
            :request-items="requestItems"
            :total-rows="totalRows"
            :page="page"
            :per-page="perPage"
            :request-review-dialog-visible="requestReviewDialog.visible"
            :request-review-dialog-submitting="requestReviewDialogSubmitting"
            :request-review-dialog-next-state="requestReviewDialog.nextState"
            :request-review-dialog-title="requestReviewDialogTitle"
            :request-review-dialog-message="requestReviewDialogMessage"
            :labels="labels"
            :display-client-name="displayClientName"
            :display-client-initials="displayClientInitials"
            :short-id="shortId"
            :format-updated-at="formatUpdatedAt"
            :request-state-text="requestStateText"
            :request-focus-items="requestFocusItems"
            :has-unread-verification-signal="hasUnreadVerificationSignal"
            :is-updating="isUpdating"
            @filter="handleRequestStateFilter"
            @refresh="handleRefreshAll"
            @retry="handleRefreshAll"
            @page="handlePaginatorPage"
            @open-client-verification="openClientVerification"
            @open-request-review-confirm="openRequestReviewConfirm"
            @close-request-review-dialog="closeRequestReviewDialog"
            @confirm-request-review-update="confirmRequestReviewUpdate" />
        </template>
      </PageStructureContent>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { definePageMeta } from "~/.nuxt/imports";
  import { useI18n } from "vue-i18n";

  import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import { useVerificationRequestsPage } from "~/composables/admin/verifications/useVerificationRequestsPage";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import VerificationsPanel from "~/pages/admin/verifications/components/VerificationsPanel.vue";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t, locale } = useI18n({ useScope: "global" });
  const pageTitle = computed(() => {
    const value = t("admin.verifications.payoutIndex.title");

    if (value !== "admin.verifications.payoutIndex.title") {
      return value;
    }

    if (locale.value === "ru") return "Верификация реквизитов";
    if (locale.value === "uk") return "Верифікація реквізитів";

    return "Payment detail verifications";
  });

  const {
    closeRequestReviewDialog,
    confirmRequestReviewUpdate,
    displayClientInitials,
    displayClientName,
    errorMessage,
    formatUpdatedAt,
    handlePaginatorPage,
    handleRefreshAll,
    handleRequestStateFilter,
    hasUnreadVerificationSignal,
    isLoading,
    isUpdating,
    labels,
    openClientVerification,
    openRequestReviewConfirm,
    page,
    perPage,
    requestFocusItems,
    requestItems,
    requestReviewDialog,
    requestReviewDialogMessage,
    requestReviewDialogSubmitting,
    requestReviewDialogTitle,
    requestReviewSendNotifications,
    requestStateFilter,
    requestStateText,
    searchInput,
    shortId,
    statCards,
    totalRows,
  } = useVerificationRequestsPage("payout");

  defineExpose({
    reload: handleRefreshAll,
  });
</script>
