<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-1 text-[var(--ui-text-main)]">
        <UiTextH4>{{ titleText }}</UiTextH4>
        <UiTextParagraph>{{ subtitleText }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <div class="withdrawal-requests-page">
        <div class="withdrawal-requests-page__stats">
          <button
            v-for="card in statCards"
            :key="card.id"
            class="withdrawal-stat-card"
            :class="[card.cardClass, { 'is-active': card.isActive }]"
            type="button"
            @click="handleStatCardClick(card.status)">
            <div class="withdrawal-stat-card__label">{{ card.label }}</div>
            <div class="withdrawal-stat-card__value">{{ card.value }}</div>
          </button>
        </div>

        <div class="withdrawal-requests-page__toolbar">
          <div class="withdrawal-requests-page__toolbar-left">
            <UiInput
              class="w-full"
              :value="searchFilter"
              :placeholder="searchPlaceholder"
              @input="handleSearchInput">
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
          </div>

          <div class="withdrawal-requests-page__toolbar-right">
            <UiButtonDefault
              state="info--small"
              class="!w-[44px]"
              @click="refreshAll">
              <UiIconUpdate :spinning="isLoading || isStatsLoading" />
            </UiButtonDefault>
          </div>
        </div>

        <div
          v-if="statusFilter"
          class="withdrawal-requests-page__active-filter">
          <span>{{ statusFilterNoteText }}: {{ statusText(statusFilter) }}</span>
          <button
            type="button"
            class="withdrawal-requests-page__active-filter-reset"
            @click="handleStatCardClick('')">
            {{ resetFilterText }}
          </button>
        </div>

        <div
          v-if="errorMessage"
          class="withdrawal-requests-page__error">
          {{ errorMessage }}
        </div>

        <div
          v-if="isLoading && requests.length === 0"
          class="withdrawal-requests-page__loading">
          <UiIconSpinnerDefault />
        </div>

        <div
          v-else-if="requests.length === 0"
          class="withdrawal-requests-page__empty">
          {{ emptyText }}
        </div>

        <div
          v-else
          class="withdrawal-requests-list">
          <article
            v-for="requestItem in requests"
            :key="requestItem.id"
            class="withdrawal-request-card">
            <div class="withdrawal-request-card__top">
              <div class="withdrawal-request-card__main">
                <div class="withdrawal-request-card__id-row">
                  <span class="withdrawal-request-card__id">#{{ shortId(requestItem.id) }}</span>
                  <span
                    class="withdrawal-request-card__status"
                    :class="statusClass(requestItem.status)">
                    {{ statusText(requestItem.status) }}
                  </span>
                </div>

                <div class="withdrawal-request-card__owner">
                  <div class="withdrawal-request-card__owner-name">{{ requestItem.owner_name || "-" }}</div>
                  <div class="withdrawal-request-card__owner-meta">
                    <span>{{ requestItem.owner_email || "-" }}</span>
                    <span v-if="requestItem.owner_phone">· {{ requestItem.owner_phone }}</span>
                    <NuxtLink
                      v-if="requestItem.user_id"
                      :to="localePath(`/clients/${requestItem.user_id}`)"
                      class="withdrawal-request-card__owner-link">
                      {{ openClientText }}
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <div class="withdrawal-request-card__side">
                <div class="withdrawal-request-card__side-head">
                  <button
                    v-if="canEditRequest(requestItem)"
                    type="button"
                    class="withdrawal-request-card__edit-link"
                    :disabled="updatingRequestId === requestItem.id"
                    @click="handleToggleEdit(requestItem)">
                    {{ editingRequestId === requestItem.id ? cancelEditText : editText }}
                  </button>

                  <div class="withdrawal-request-card__amount">
                    {{ formatMoney(requestItem.amount, requestItem.currency || requestItem.account_currency || "USD") }}
                  </div>
                </div>

                <div
                  v-if="canManagePayments"
                  class="withdrawal-request-card__status-actions withdrawal-request-card__status-actions--top">
                  <button
                    type="button"
                    class="withdrawal-status-action withdrawal-status-action--successful"
                    :class="{ 'is-active': isStatusActive(requestItem, 'successful') }"
                    :disabled="isStatusDisabled(requestItem, 'successful')"
                    :title="successfulActionTitle(requestItem)"
                    @click="handleQuickStatusUpdate(requestItem, 'successful')">
                    <UiIconSuccessFull />
                  </button>

                  <button
                    type="button"
                    class="withdrawal-status-action withdrawal-status-action--rejected"
                    :class="{ 'is-active': isStatusActive(requestItem, 'rejected') }"
                    :disabled="isStatusDisabled(requestItem, 'rejected')"
                    :title="rejectText"
                    @click="handleQuickStatusUpdate(requestItem, 'rejected')">
                    <UiIconDangerFull />
                  </button>
                </div>
              </div>
            </div>

            <div class="withdrawal-request-card__grid">
              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ accountText }}</div>
                <div class="withdrawal-request-card__value">
                  {{ requestItem.account_number || "-" }}
                  <span v-if="requestItem.account_balance !== undefined">
                    ·
                    {{
                      formatMoney(
                        requestItem.account_balance,
                        requestItem.account_currency || requestItem.currency || "USD"
                      )
                    }}
                  </span>
                </div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ paymentMethodText }}</div>
                <div class="withdrawal-request-card__value">{{ requestItem.payment_system_name || "-" }}</div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">
                  {{ requestItem.is_internal_transfer ? transferRouteText : paymentDetailText }}
                </div>
                <div class="withdrawal-request-card__value">
                  {{
                    requestItem.is_internal_transfer
                      ? transferRouteValue(requestItem)
                      : requestItem.payment_detail_name || "-"
                  }}
                </div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ createdAtText }}</div>
                <div class="withdrawal-request-card__value">{{ formatDateTime(requestItem.created_at) }}</div>
              </div>

              <div
                v-if="requestItem.is_internal_transfer"
                class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ executionText }}</div>
                <div class="withdrawal-request-card__value">{{ internalTransferExecutionText(requestItem) }}</div>
              </div>
            </div>

            <div
              v-if="requestItem.comment"
              class="withdrawal-request-card__comment">
              <div class="withdrawal-request-card__label">{{ clientCommentText }}</div>
              <div class="withdrawal-request-card__comment-body">{{ requestItem.comment }}</div>
            </div>

            <div
              v-if="requestItem.admin_comment"
              class="withdrawal-request-card__comment withdrawal-request-card__comment--admin">
              <div class="withdrawal-request-card__label">{{ adminCommentText }}</div>
              <div class="withdrawal-request-card__comment-body">{{ requestItem.admin_comment }}</div>
            </div>

            <div
              v-if="!requestItem.is_internal_transfer && hasPaymentDetailData(requestItem)"
              class="withdrawal-request-card__details-panel">
              <div class="withdrawal-request-card__details-header">
                <div>
                  <div class="withdrawal-request-card__label">{{ paymentDetailText }}</div>
                  <div class="withdrawal-request-card__details-title">
                    {{ requestItem.payment_detail_name || requestItem.payment_detail?.name || "-" }}
                  </div>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-1 text-xs font-medium text-[var(--ui-text-main)] transition hover:border-[var(--ui-primary-accent)]"
                  :aria-expanded="isPaymentDetailExpanded(requestItem.id) ? 'true' : 'false'"
                  :title="paymentDetailText"
                  @click="togglePaymentDetailExpanded(requestItem.id)">
                  <span>{{ documentsText }} {{ requestItem.payment_detail?.documents?.length || 0 }}</span>
                  <UiIconChevronUp v-if="isPaymentDetailExpanded(requestItem.id)" class="!h-3.5 !w-3.5" />
                  <UiIconChevronDown v-else class="!h-3.5 !w-3.5" />
                </button>
              </div>

              <div v-if="isPaymentDetailExpanded(requestItem.id)">
                <div
                  v-if="paymentDetailEntries(requestItem).length"
                  class="withdrawal-request-card__details-grid">
                  <div
                    v-for="entry in paymentDetailEntries(requestItem)"
                    :key="entry.key"
                    class="withdrawal-request-card__details-item">
                    <div class="withdrawal-request-card__details-key">{{ entry.label }}</div>
                    <div class="withdrawal-request-card__details-value-row">
                      <div class="withdrawal-request-card__details-value">{{ entry.value }}</div>
                      <UiIconCopy
                        class="withdrawal-request-card__details-copy"
                        :text="entry.value"
                        :title="copyValueText" />
                    </div>
                  </div>
                </div>

                <div
                  v-if="requestItem.payment_detail?.documents?.length"
                  class="withdrawal-request-card__details-documents">
                  <div class="withdrawal-request-card__details-key">{{ documentsText }}</div>
                  <div class="withdrawal-request-card__details-document-list">
                    <a
                      v-for="document in requestItem.payment_detail.documents"
                      :key="`${requestItem.id}-${document.path}`"
                      class="flex min-w-0 items-center gap-3 rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--color-stroke-ui-dark)] px-3 py-2 text-[var(--ui-text-main)] transition hover:border-[var(--ui-primary-accent)]"
                      :href="paymentDetailDocumentHref(document)"
                      target="_blank"
                      rel="noopener noreferrer">
                      <img
                        v-if="isPaymentDetailDocumentImage(document)"
                        :src="paymentDetailDocumentHref(document)"
                        :alt="document.name || documentsText"
                        class="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      <div
                        v-else
                        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] text-[10px] font-semibold uppercase text-[var(--ui-text-secondary)]">
                        {{ paymentDetailDocumentExtension(document) }}
                      </div>
                      <span class="truncate text-sm font-medium">{{ document.name || document.path }}</span>
                    </a>
                  </div>
                </div>

                <div
                  v-if="requestItem.payment_detail?.comment"
                  class="withdrawal-request-card__details-note">
                  <div class="withdrawal-request-card__details-key">{{ requisitesCommentText }}</div>
                  <div class="withdrawal-request-card__comment-body">{{ requestItem.payment_detail.comment }}</div>
                </div>
              </div>
            </div>

            <div
              v-if="editingRequestId === requestItem.id"
              class="withdrawal-request-card__edit">
              <div
                v-if="auxiliaryLoadingUserId === requestItem.user_id"
                class="withdrawal-request-card__edit-loading">
                <UiIconSpinnerDefault />
              </div>

              <template v-else>
                <div class="withdrawal-request-card__edit-grid">
                  <div class="withdrawal-request-card__edit-field">
                    <label class="withdrawal-request-card__edit-label">{{ accountText }}</label>
                    <UiSelect
                      :without-no-select="true"
                      :value="editForm.accountId"
                      :data="accountOptionsByUserId[requestItem.user_id] || []"
                      @change="value => handleEditSelectChange('accountId', value)" />
                    <div
                      v-if="editErrors.accountId"
                      class="withdrawal-request-card__edit-error">
                      {{ editErrors.accountId }}
                    </div>
                  </div>

                  <div class="withdrawal-request-card__edit-field">
                    <label class="withdrawal-request-card__edit-label">{{ paymentDetailText }}</label>
                    <UiSelect
                      :without-no-select="true"
                      :value="editForm.paymentDetailId"
                      :data="paymentDetailOptionsByUserId[requestItem.user_id] || []"
                      @change="value => handleEditSelectChange('paymentDetailId', value)" />
                    <div
                      v-if="editErrors.paymentDetailId"
                      class="withdrawal-request-card__edit-error">
                      {{ editErrors.paymentDetailId }}
                    </div>
                  </div>

                  <div class="withdrawal-request-card__edit-field">
                    <label class="withdrawal-request-card__edit-label">{{ amountText }}</label>
                    <UiInput
                      type="number"
                      :value="editForm.amount"
                      @input="value => handleEditInput('amount', value)" />
                    <div
                      v-if="editErrors.amount"
                      class="withdrawal-request-card__edit-error">
                      {{ editErrors.amount }}
                    </div>
                  </div>
                </div>

                <div class="withdrawal-request-card__edit-field">
                  <label class="withdrawal-request-card__edit-label">{{ clientCommentText }}</label>
                  <textarea
                    class="withdrawal-request-card__textarea"
                    :value="editForm.comment"
                    @input="event => handleEditTextarea('comment', event)" />
                </div>

                <div class="withdrawal-request-card__edit-field">
                  <label class="withdrawal-request-card__edit-label">{{ adminCommentText }}</label>
                  <textarea
                    class="withdrawal-request-card__textarea"
                    :value="editForm.adminComment"
                    @input="event => handleEditTextarea('adminComment', event)" />
                </div>

                <div class="withdrawal-request-card__actions">
                  <UiButtonDefault
                    state="info"
                    class="withdrawal-request-card__action-btn"
                    :disabled="updatingRequestId === requestItem.id"
                    @click="handleSaveEdit(requestItem)">
                    {{ saveText }}
                  </UiButtonDefault>
                </div>
              </template>
            </div>
          </article>
        </div>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { computed, onMounted, reactive, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { useToast } from "vue-toastification";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconSearch from "~/components/ui/UiIconSearch.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
  import UiInput from "~/components/ui/UiInput.vue";
  import UiSelect from "~/components/ui/UiSelect.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconChevronDown from "~/components/ui/UiIconChevronDown.vue";
  import UiIconChevronUp from "~/components/ui/UiIconChevronUp.vue";
  import useAppCore from "~/composables/useAppCore";
  import useEventBus from "~/composables/useEventBus";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";
  import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  type WithdrawalRequestItem = {
    id: string;
    user_id: string;
    owner_name: string;
    owner_email: string;
    owner_phone: string;
    account_id: string;
    account_number: string;
    account_balance: number;
    account_currency: string;
    payment_detail_id: string;
    payment_detail_name: string;
    payment_detail_status: string;
    payment_system_name: string;
    amount: number;
    currency: string;
    status: string;
    comment: string;
    admin_comment: string;
    created_at: string;
    is_internal_transfer: boolean;
    from_account_number: string;
    to_account_number: string;
    meta: Record<string, any>;
    payment_detail: {
      id: string;
      name: string;
      status: string;
      payment_system_id: string;
      payment_system_name: string;
      data: Record<string, unknown>;
      comment: string;
      documents: Array<{
        name: string;
        path: string;
        mime_type: string;
        size: number | null;
        uploaded_at: string | null;
        preview_url: string | null;
      }>;
    };
  };
  type WithdrawalStatusAction = "successful" | "failed" | "cancelled" | "rejected";

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const adminNotificationsStore = useAdminNotificationsStore();
  const ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "admin-notifications-marked-by-types";

  const requests = ref<WithdrawalRequestItem[]>([]);
  const isLoading = ref(false);
  const isStatsLoading = ref(false);
  const errorMessage = ref("");
  const searchFilter = ref("");
  const statusFilter = ref("pending");
  const editingRequestId = ref("");
  const updatingRequestId = ref("");
  const auxiliaryLoadingUserId = ref("");
  const stats = reactive({
    total: 0,
    pending: 0,
    processing: 0,
    successful: 0,
    failed: 0,
    cancelled: 0,
    rejected: 0,
  });
  const accountOptionsByUserId = reactive<Record<string, Array<{ id: string; value: string; text: string }>>>({});
  const paymentDetailOptionsByUserId = reactive<Record<string, Array<{ id: string; value: string; text: string }>>>({});
  const editForm = reactive({
    requestId: "",
    accountId: "",
    paymentDetailId: "",
    amount: "",
    comment: "",
    adminComment: "",
  });
  const editErrors = reactive<Record<string, string>>({});
  const expandedPaymentDetailIds = ref<string[]>([]);

  const resolveText = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const titleText = computed(() => resolveText("admin.withdrawalRequests.title", "Withdrawal requests"));
  const subtitleText = computed(() =>
    resolveText(
      "admin.withdrawalRequests.subtitle",
      "Moderate client withdrawal and transfer requests, update statuses and edit payout data before manual processing."
    )
  );
  const searchPlaceholder = computed(() =>
    resolveText("admin.withdrawalRequests.searchPlaceholder", "Search by ID, client, comment or account")
  );
  const emptyText = computed(() => resolveText("admin.withdrawalRequests.empty", "No withdrawal requests found."));
  const accountText = computed(() => resolveText("admin.withdrawalRequests.fields.account", "Account"));
  const paymentMethodText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.paymentMethod", "Payment method")
  );
  const paymentDetailText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.paymentDetail", "Payment details")
  );
  const transferRouteText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.transferRoute", "Transfer route")
  );
  const executionText = computed(() => resolveText("admin.withdrawalRequests.fields.execution", "Execution"));
  const amountText = computed(() => resolveText("admin.withdrawalRequests.fields.amount", "Amount"));
  const createdAtText = computed(() => resolveText("admin.withdrawalRequests.fields.createdAt", "Created at"));
  const clientCommentText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.clientComment", "Client comment")
  );
  const documentsText = computed(() => resolveText("admin.withdrawalRequests.fields.documents", "Documents"));
  const requisitesCommentText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.requisitesComment", "Requisites comment")
  );
  const adminCommentText = computed(() => resolveText("admin.withdrawalRequests.fields.adminComment", "Admin comment"));
  const openClientText = computed(() => resolveText("admin.withdrawalRequests.actions.openClient", "Open client"));
  const editText = computed(() => resolveText("admin.withdrawalRequests.actions.edit", "Edit"));
  const cancelEditText = computed(() => resolveText("admin.withdrawalRequests.actions.cancelEdit", "Cancel"));
  const saveText = computed(() => resolveText("admin.withdrawalRequests.actions.save", "Save"));
  const markSuccessfulText = computed(() => resolveText("admin.withdrawalRequests.actions.successful", "Successful"));
  const markSuccessfulAndTransferText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.successfulAutoTransfer", "Confirm and execute MT4 transfer")
  );
  const copyValueText = computed(() => resolveText("admin.withdrawalRequests.actions.copyValue", "Copy value"));
  const rejectText = computed(() => resolveText("admin.withdrawalRequests.actions.reject", "Reject"));
  const statusFilterNoteText = computed(() =>
    resolveText("admin.withdrawalRequests.filters.currentStatus", "Status filter")
  );
  const resetFilterText = computed(() => resolveText("admin.withdrawalRequests.filters.reset", "Reset"));
  const savedText = computed(() =>
    resolveText("admin.withdrawalRequests.messages.saved", "Withdrawal request updated.")
  );
  const statusUpdatedText = computed(() =>
    resolveText("admin.withdrawalRequests.messages.statusUpdated", "Withdrawal request status updated.")
  );

  const canManagePayments = computed(
    () =>
      adminAuthStore.hasRole("super-admin") ||
      adminAuthStore.hasPermission("manage-payments") ||
      adminAuthStore.hasPermission("update-payments")
  );

  const statCards = computed(() => [
    {
      id: "pending",
      status: "pending",
      label: statusText("pending"),
      value: stats.pending,
      cardClass: "is-pending",
      isActive: statusFilter.value === "pending",
    },
    {
      id: "total",
      status: "",
      label: resolveText("admin.withdrawalRequests.stats.total", "Total"),
      value: stats.total,
      cardClass: "is-total",
      isActive: statusFilter.value === "",
    },
    {
      id: "successful",
      status: "successful",
      label: statusText("successful"),
      value: stats.successful,
      cardClass: "is-success",
      isActive: statusFilter.value === "successful",
    },
    {
      id: "rejected",
      status: "rejected",
      label: statusText("rejected"),
      value: stats.rejected,
      cardClass: "is-rejected",
      isActive: statusFilter.value === "rejected",
    },
  ]);

  const extractRows = (response: any): any[] => {
    const root = response?.data;
    const data = root?.data;

    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(root)) return root;

    return [];
  };

  const statusText = (value: string): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    const key = `admin.withdrawalRequests.statuses.${normalized}`;

    switch (normalized) {
      case "pending":
        return resolveText(key, "Pending");
      case "processing":
        return resolveText(key, "Processing");
      case "successful":
        return resolveText(key, "Successful");
      case "rejected":
      case "failed":
      case "cancelled":
        return resolveText("admin.withdrawalRequests.statuses.rejected", "Rejected");
      default:
        return normalized || "-";
    }
  };

  const statusClass = (value: string): string => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();

    if (normalized === "successful") return "is-success";
    if (normalized === "rejected") return "is-failed";
    if (normalized === "failed") return "is-failed";
    if (normalized === "cancelled") return "is-cancelled";
    if (normalized === "processing") return "is-processing";
    return "is-pending";
  };

  const shortId = (value: string): string => {
    const normalized = String(value ?? "").trim();
    if (!normalized) return "-";
    return normalized.split("-").pop() ?? normalized;
  };

  const formatDateTime = (value: string): string => {
    const date = new Date(String(value ?? ""));
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  const formatMoney = (value: number, currency: string): string => {
    const amount = Number(value ?? 0);
    const code = String(currency || "USD");

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${code} ${amount.toFixed(2)}`;
    }
  };

  const normalizePaymentDetailLabel = (key: string): string => {
    return String(key ?? "")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, letter => letter.toUpperCase());
  };

  const paymentDetailFieldLabel = (key: string): string => {
    const normalizedKey = String(key ?? "")
      .trim()
      .replace(/[-_\s]+([a-zA-Z0-9])/g, (_, letter: string) => letter.toUpperCase())
      .replace(/^([A-Z])/, letter => letter.toLowerCase());
    const translationKey = `admin.withdrawalRequests.paymentDetailFields.${normalizedKey}`;
    const translated = t(translationKey);

    return translated === translationKey ? normalizePaymentDetailLabel(key) : translated;
  };

  const formatPaymentDetailValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value
        .map(item => formatPaymentDetailValue(item))
        .filter(Boolean)
        .join(", ");
    }

    if (value && typeof value === "object") {
      return Object.entries(value as Record<string, unknown>)
        .map(
          ([nestedKey, nestedValue]) =>
            `${normalizePaymentDetailLabel(nestedKey)}: ${formatPaymentDetailValue(nestedValue)}`
        )
        .join(" · ");
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    return String(value ?? "").trim();
  };

  const paymentDetailEntries = (
    requestItem: WithdrawalRequestItem
  ): Array<{ key: string; label: string; value: string }> => {
    const detail = requestItem.payment_detail;
    if (!detail || !detail.data || typeof detail.data !== "object") {
      return [];
    }

    return Object.entries(detail.data)
      .map(([key, value]) => ({
        key,
        label: paymentDetailFieldLabel(key),
        value: formatPaymentDetailValue(value),
      }))
      .filter(entry => entry.value !== "");
  };

  const hasPaymentDetailData = (requestItem: WithdrawalRequestItem): boolean => {
    return (
      paymentDetailEntries(requestItem).length > 0 ||
      Boolean(requestItem.payment_detail?.comment) ||
      Boolean(requestItem.payment_detail?.documents?.length)
    );
  };

  const isPaymentDetailExpanded = (requestId: string): boolean => expandedPaymentDetailIds.value.includes(requestId);

  const togglePaymentDetailExpanded = (requestId: string): void => {
    expandedPaymentDetailIds.value = isPaymentDetailExpanded(requestId)
      ? expandedPaymentDetailIds.value.filter(id => id !== requestId)
      : [...expandedPaymentDetailIds.value, requestId];
  };

  const paymentDetailDocumentHref = (document: {
    path: string;
    preview_url: string | null;
  }): string => {
    const previewUrl = String(document?.preview_url ?? "").trim();
    if (previewUrl !== "") {
      return previewUrl;
    }

    return String(document?.path ?? "").trim();
  };

  const isPaymentDetailDocumentImage = (document: {
    mime_type: string;
    path: string;
    preview_url: string | null;
  }): boolean => {
    const href = paymentDetailDocumentHref(document);
    if (href === "") {
      return false;
    }

    return String(document?.mime_type ?? "")
      .trim()
      .toLowerCase()
      .startsWith("image/");
  };

  const paymentDetailDocumentExtension = (document: { name: string; path: string; mime_type: string }): string => {
    const name = String(document?.name || document?.path || "").trim();
    const extension = name.includes(".") ? name.split(".").pop() ?? "" : "";
    const normalizedExtension = extension.trim().toUpperCase();

    if (normalizedExtension !== "") {
      return normalizedExtension.slice(0, 4);
    }

    if (String(document?.mime_type ?? "").toLowerCase().includes("pdf")) {
      return "PDF";
    }

    return "FILE";
  };

  const normalizeRequest = (row: any): WithdrawalRequestItem => ({
    id: String(row?.id ?? ""),
    user_id: String(row?.user_id ?? ""),
    owner_name: String(row?.owner_name ?? ""),
    owner_email: String(row?.owner_email ?? ""),
    owner_phone: String(row?.owner_phone ?? ""),
    account_id: String(row?.account_id ?? ""),
    account_number: String(row?.account_number ?? ""),
    account_balance: Number(row?.account_balance ?? 0),
    account_currency: String(row?.account_currency ?? ""),
    payment_detail_id: String(row?.payment_detail_id ?? ""),
    payment_detail_name: String(row?.payment_detail_name ?? ""),
    payment_detail_status: String(row?.payment_detail_status ?? ""),
    payment_system_name: String(row?.payment_system_name ?? ""),
    amount: Number(row?.amount ?? 0),
    currency: String(row?.currency ?? ""),
    status: String(row?.status ?? ""),
    comment: String(row?.comment ?? ""),
    admin_comment: String(row?.admin_comment ?? ""),
    created_at: String(row?.created_at ?? ""),
    is_internal_transfer: Boolean(row?.is_internal_transfer || row?.meta?.is_internal_transfer),
    from_account_number: String(row?.from_account_number ?? row?.meta?.from_account_number ?? ""),
    to_account_number: String(row?.to_account_number ?? row?.meta?.to_account_number ?? ""),
    meta: row?.meta && typeof row.meta === "object" ? row.meta : {},
    payment_detail: {
      id: String(row?.payment_detail?.id ?? ""),
      name: String(row?.payment_detail?.name ?? ""),
      status: String(row?.payment_detail?.status ?? ""),
      payment_system_id: String(row?.payment_detail?.payment_system_id ?? ""),
      payment_system_name: String(row?.payment_detail?.payment_system_name ?? ""),
      data: row?.payment_detail?.data && typeof row.payment_detail.data === "object" ? row.payment_detail.data : {},
      comment: String(row?.payment_detail?.comment ?? ""),
      documents: Array.isArray(row?.payment_detail?.documents)
        ? row.payment_detail.documents.map((document: any) => ({
            name: String(document?.name ?? ""),
            path: String(document?.path ?? ""),
            mime_type: String(document?.mime_type ?? ""),
            size: document?.size == null ? null : Number(document.size),
            uploaded_at: document?.uploaded_at == null ? null : String(document.uploaded_at),
            preview_url: document?.preview_url == null ? null : String(document.preview_url),
          }))
        : [],
    },
  });

  const resetEditErrors = (): void => {
    Object.keys(editErrors).forEach(key => delete editErrors[key]);
  };

  const loadRequests = async (): Promise<void> => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.payments.getWithdrawalRequests({
        perPage: 100,
        page: 1,
        orderBy: "created_at",
        orderDirection: "desc",
        searchFilter: searchFilter.value.trim(),
        filters: statusFilter.value ? { status: statusFilter.value } : {},
      });

      requests.value = extractRows(response).map(normalizeRequest);
    } catch (error: any) {
      errorMessage.value =
        error?.response?.data?.message ||
        resolveText("admin.withdrawalRequests.messages.loadError", "Failed to load withdrawal requests.");
    } finally {
      isLoading.value = false;
    }
  };

  const loadStats = async (): Promise<void> => {
    isStatsLoading.value = true;

    try {
      const response = await appCore.payments.getWithdrawalRequestsStats();
      const payload = response?.data?.data ?? {};

      stats.total = Number(payload?.total ?? 0);
      stats.pending = Number(payload?.pending ?? 0);
      stats.processing = Number(payload?.processing ?? 0);
      stats.successful = Number(payload?.successful ?? 0);
      stats.failed = Number(payload?.failed ?? 0);
      stats.cancelled = Number(payload?.cancelled ?? 0);
      stats.rejected = Number(payload?.rejected ?? stats.failed + stats.cancelled);
    } finally {
      isStatsLoading.value = false;
    }
  };

  const refreshAll = async (): Promise<void> => {
    await Promise.all([loadRequests(), loadStats()]);
  };

  const markWithdrawalNotificationsSeen = async (): Promise<void> => {
    try {
      const types = ["payments.withdrawal.created"];
      const response = await appCore.adminModules.notifications.markReadByTypes(["payments.withdrawal.created"]);
      const summary = response?.data?.data ?? {};
      adminNotificationsStore.applySummary(summary);
      useEventBus.emit(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, { types, summary });
    } catch {
      // no-op
    }
  };

  const handleSearchInput = async (value: string): Promise<void> => {
    searchFilter.value = value;
    await loadRequests();
  };

  const handleStatCardClick = async (value: string): Promise<void> => {
    statusFilter.value = String(value ?? "");
    await loadRequests();
  };

  const canEditRequest = (requestItem: WithdrawalRequestItem): boolean =>
    canManagePayments.value &&
    !requestItem.is_internal_transfer &&
    String(requestItem.status).toLowerCase() !== "successful";

  const isStatusActive = (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction
  ): boolean => {
    const current = String(requestItem.status).toLowerCase();

    if (nextStatus === "failed" || nextStatus === "rejected") {
      return ["failed", "cancelled", "rejected"].includes(current);
    }

    return current === nextStatus;
  };

  const canMoveToStatus = (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction
  ): boolean => {
    const current = String(requestItem.status ?? "").toLowerCase();

    if (current === "successful" && nextStatus !== "successful") {
      return false;
    }

    switch (nextStatus) {
      case "successful":
        return ["pending", "processing", "failed", "rejected", "successful"].includes(current);
      case "cancelled":
        return ["pending", "processing", "failed", "rejected", "cancelled"].includes(current);
      case "failed":
      case "rejected":
        return ["pending", "processing", "failed", "rejected", "cancelled"].includes(current);
      default:
        return false;
    }
  };

  const isStatusDisabled = (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction
  ): boolean =>
    updatingRequestId.value === requestItem.id ||
    (isStatusActive(requestItem, nextStatus) &&
      !(requestItem.is_internal_transfer && nextStatus === "successful" && !isTransferExecuted(requestItem))) ||
    !canMoveToStatus(requestItem, nextStatus);

  const isTransferExecuted = (requestItem: WithdrawalRequestItem): boolean =>
    String(requestItem.meta?.transfer_execution?.status ?? "").toLowerCase() === "completed";

  const successfulActionTitle = (requestItem: WithdrawalRequestItem): string =>
    requestItem.is_internal_transfer ? markSuccessfulAndTransferText.value : markSuccessfulText.value;

  const transferRouteValue = (requestItem: WithdrawalRequestItem): string => {
    const from = String(requestItem.from_account_number ?? "").trim() || "-";
    const to = String(requestItem.to_account_number ?? "").trim() || "-";
    return `${from} → ${to}`;
  };

  const internalTransferExecutionText = (requestItem: WithdrawalRequestItem): string => {
    const status = String(requestItem.meta?.transfer_execution?.status ?? "")
      .trim()
      .toLowerCase();

    if (status === "completed") {
      return resolveText("admin.withdrawalRequests.execution.completed", "Executed in MT4");
    }

    if (status === "skipped") {
      return resolveText("admin.withdrawalRequests.execution.skipped", "Confirmed without automatic transfer");
    }

    if (status === "failed") {
      return resolveText("admin.withdrawalRequests.execution.failed", "Automatic transfer failed");
    }

    if (status === "cancelled") {
      return resolveText("admin.withdrawalRequests.execution.cancelled", "Cancelled");
    }

    return resolveText("admin.withdrawalRequests.execution.pending", "Awaiting admin decision");
  };

  const buildStatusConfirmText = (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction
  ): string =>
    requestItem.is_internal_transfer && nextStatus === "successful"
      ? `${resolveText(
          "admin.withdrawalRequests.messages.confirmAutoTransfer",
          "Confirm request and execute MT4 transfer"
        )} #${shortId(requestItem.id)}?`
      : `${resolveText("admin.withdrawalRequests.messages.confirmStatusChange", "Change request")} #${shortId(
          requestItem.id
        )} ${resolveText("admin.withdrawalRequests.messages.confirmStatusChangeTo", "to status")} "${statusText(nextStatus)}"?`;

  const handleQuickStatusUpdate = async (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction,
    options: { executeTransfer?: boolean } = {}
  ): Promise<void> => {
    const executeTransfer = options.executeTransfer || (requestItem.is_internal_transfer && nextStatus === "successful");

    if (
      !canManagePayments.value ||
      isStatusDisabled(requestItem, nextStatus)
    ) {
      return;
    }

    const isConfirmed = window.confirm(buildStatusConfirmText(requestItem, nextStatus));
    if (!isConfirmed) {
      return;
    }

    updatingRequestId.value = requestItem.id;

    try {
      await appCore.payments.updateWithdrawalRequestStatus(requestItem.id, {
        status: nextStatus,
        admin_comment:
          editingRequestId.value === requestItem.id ? editForm.adminComment.trim() : requestItem.admin_comment,
        ...(executeTransfer ? { execute_transfer: true } : {}),
      });

      toast.success(statusUpdatedText.value);
      await refreshAll();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          resolveText("admin.withdrawalRequests.messages.statusError", "Failed to update withdrawal request status.")
      );
    } finally {
      updatingRequestId.value = "";
    }
  };

  const loadEditDependencies = async (requestItem: WithdrawalRequestItem): Promise<void> => {
    if (accountOptionsByUserId[requestItem.user_id] && paymentDetailOptionsByUserId[requestItem.user_id]) {
      return;
    }

    auxiliaryLoadingUserId.value = requestItem.user_id;

    try {
      const [accountsResponse, paymentDetailsResponse] = await Promise.all([
        appCore.adminModules.accounts.get({
          perPage: 100,
          page: 1,
          filters: { user_id: requestItem.user_id },
        }),
        appCore.adminModules.clients.getPaymentDetails(requestItem.user_id),
      ]);

      const rawAccounts = extractRows(accountsResponse);
      accountOptionsByUserId[requestItem.user_id] = rawAccounts.map((row: any) => {
        const balance = Number(row?.balance ?? 0);
        const currency = String(row?.currency ?? "USD");
        const number = String(row?.number ?? "");

        return {
          id: String(row?.id ?? ""),
          value: String(row?.id ?? ""),
          text: `${number} • ${formatMoney(balance, currency)}`,
        };
      });

      const rawPaymentDetails = Array.isArray(paymentDetailsResponse?.data?.data)
        ? paymentDetailsResponse.data.data
        : [];
      paymentDetailOptionsByUserId[requestItem.user_id] = rawPaymentDetails
        .filter((row: any) => String(row?.status ?? "").toLowerCase() === "approved")
        .map((row: any) => ({
          id: String(row?.id ?? ""),
          value: String(row?.id ?? ""),
          text: String(row?.name ?? row?.payment_system?.name ?? row?.paymentSystem?.name ?? "Payment detail"),
        }));
    } finally {
      auxiliaryLoadingUserId.value = "";
    }
  };

  const fillEditForm = (requestItem: WithdrawalRequestItem): void => {
    editForm.requestId = requestItem.id;
    editForm.accountId = requestItem.account_id;
    editForm.paymentDetailId = requestItem.payment_detail_id;
    editForm.amount = String(requestItem.amount ?? "");
    editForm.comment = requestItem.comment || "";
    editForm.adminComment = requestItem.admin_comment || "";
  };

  const handleToggleEdit = async (requestItem: WithdrawalRequestItem): Promise<void> => {
    if (editingRequestId.value === requestItem.id) {
      editingRequestId.value = "";
      resetEditErrors();
      return;
    }

    resetEditErrors();
    editingRequestId.value = requestItem.id;
    fillEditForm(requestItem);
    await loadEditDependencies(requestItem);
  };

  const handleEditSelectChange = (key: "accountId" | "paymentDetailId", value: string | null): void => {
    editForm[key] = String(value ?? "");
    delete editErrors[key];
  };

  const handleEditInput = (key: "amount", value: string): void => {
    editForm[key] = value;
    delete editErrors[key];
  };

  const handleEditTextarea = (key: "comment" | "adminComment", event: Event): void => {
    editForm[key] = String((event.target as HTMLTextAreaElement)?.value ?? "");
  };

  const validateEditForm = (): boolean => {
    resetEditErrors();

    if (!editForm.accountId) {
      editErrors.accountId = resolveText("admin.withdrawalRequests.validation.account", "Choose an account.");
    }

    if (!editForm.paymentDetailId) {
      editErrors.paymentDetailId = resolveText(
        "admin.withdrawalRequests.validation.paymentDetail",
        "Choose approved payment details."
      );
    }

    const amount = Number(editForm.amount);
    if (!editForm.amount || !Number.isFinite(amount) || amount <= 0) {
      editErrors.amount = resolveText("admin.withdrawalRequests.validation.amount", "Enter a valid amount.");
    }

    return Object.keys(editErrors).length === 0;
  };

  const handleSaveEdit = async (requestItem: WithdrawalRequestItem): Promise<void> => {
    if (!validateEditForm()) {
      return;
    }

    updatingRequestId.value = requestItem.id;

    try {
      await appCore.payments.updateWithdrawalRequest(requestItem.id, {
        account_id: editForm.accountId,
        payment_detail_id: editForm.paymentDetailId,
        amount: Number(editForm.amount),
        comment: editForm.comment.trim(),
        admin_comment: editForm.adminComment.trim(),
      });

      toast.success(savedText.value);
      editingRequestId.value = "";
      await refreshAll();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          resolveText("admin.withdrawalRequests.messages.saveError", "Failed to update withdrawal request.")
      );
    } finally {
      updatingRequestId.value = "";
    }
  };

  onMounted(async () => {
    await refreshAll();

    if (!errorMessage.value) {
      await markWithdrawalNotificationsSeen();
    }
  });
</script>

<style scoped lang="scss">
  .withdrawal-requests-page {
    display: flex;
    flex-direction: column;
    gap: 18px;
    color: var(--ui-text-main);
  }

  .withdrawal-requests-page__stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }

  .withdrawal-stat-card {
    appearance: none;
    text-align: left;
    cursor: pointer;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 16px;
    background: var(--ui-background-panel);
    padding: 14px 16px;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  .withdrawal-stat-card:hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 34%, transparent);
  }

  .withdrawal-stat-card.is-total {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--ui-primary-main) 8%, transparent) 0%, transparent 72%),
      var(--ui-background-panel);
  }

  .withdrawal-stat-card.is-pending {
    background:
      linear-gradient(135deg, color-mix(in srgb, #f59e0b 10%, transparent) 0%, transparent 72%),
      var(--ui-background-panel);
  }

  .withdrawal-stat-card.is-success {
    background:
      linear-gradient(135deg, color-mix(in srgb, #22c55e 10%, transparent) 0%, transparent 72%),
      var(--ui-background-panel);
  }

  .withdrawal-stat-card.is-failed,
  .withdrawal-stat-card.is-cancelled,
  .withdrawal-stat-card.is-rejected {
    background:
      linear-gradient(135deg, color-mix(in srgb, #ef4444 10%, transparent) 0%, transparent 72%),
      var(--ui-background-panel);
  }

  .withdrawal-stat-card.is-active {
    border-color: color-mix(in srgb, var(--ui-primary-main) 58%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 32%, transparent);
  }

  .withdrawal-stat-card__label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .withdrawal-stat-card__value {
    margin-top: 6px;
    font-size: 26px;
    font-weight: 700;
  }

  .withdrawal-requests-page__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .withdrawal-requests-page__toolbar-left,
  .withdrawal-requests-page__toolbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .withdrawal-requests-page__toolbar-left {
    width: 100%;
  }

  .withdrawal-requests-page__toolbar-right {
    justify-content: flex-end;
  }

  .withdrawal-requests-page__active-filter {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 24%, transparent);
    border-radius: 14px;
    background: color-mix(in srgb, var(--ui-primary-main) 8%, transparent);
    color: var(--ui-text-secondary);
  }

  .withdrawal-requests-page__active-filter-reset {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 999px;
    background: var(--color-stroke-ui-dark);
    color: var(--ui-text-main);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .withdrawal-requests-page__active-filter-reset:hover {
    border-color: color-mix(in srgb, var(--ui-primary-main) 36%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
  }

  .withdrawal-requests-page__error,
  .withdrawal-requests-page__empty,
  .withdrawal-requests-page__loading {
    min-height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-background-panel);
    padding: 16px;
    text-align: center;
  }

  .withdrawal-requests-page__error {
    color: var(--ui-sticker-danger);
  }

  .withdrawal-requests-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .withdrawal-request-card {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 18px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--ui-background-card) 82%, transparent) 0%, transparent 100%),
      var(--ui-background-panel);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .withdrawal-request-card__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .withdrawal-request-card__id-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
  }

  .withdrawal-request-card__id {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ui-text-secondary);
  }

  .withdrawal-request-card__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 26px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
  }

  .withdrawal-request-card__status.is-pending {
    background: color-mix(in srgb, #f59e0b 16%, transparent);
    color: #f59e0b;
  }

  .withdrawal-request-card__status.is-processing {
    background: color-mix(in srgb, #3b82f6 16%, transparent);
    color: #3b82f6;
  }

  .withdrawal-request-card__status.is-success {
    background: color-mix(in srgb, #22c55e 16%, transparent);
    color: #22c55e;
  }

  .withdrawal-request-card__status.is-failed,
  .withdrawal-request-card__status.is-cancelled {
    background: color-mix(in srgb, #ef4444 16%, transparent);
    color: #ef4444;
  }

  .withdrawal-request-card__owner-name {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
  }

  .withdrawal-request-card__owner-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    color: var(--ui-text-secondary);
    font-size: 13px;
    line-height: 1.45;
  }

  .withdrawal-request-card__owner-link {
    color: var(--ui-primary-main);
  }

  .withdrawal-request-card__side {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
    margin-left: auto;
  }

  .withdrawal-request-card__side-head {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  .withdrawal-request-card__edit-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 30px;
    padding: 0 12px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 24%, transparent);
    border-radius: 10px;
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    color: var(--ui-primary-main);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .withdrawal-request-card__edit-link:not(:disabled):hover {
    transform: translateY(-1px);
    border-color: color-mix(in srgb, var(--ui-primary-main) 42%, transparent);
    background: color-mix(in srgb, var(--ui-primary-main) 16%, transparent);
  }

  .withdrawal-request-card__edit-link:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .withdrawal-request-card__amount {
    font-size: 28px;
    font-weight: 700;
    white-space: nowrap;
    line-height: 1;
  }

  .withdrawal-request-card__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  .withdrawal-request-card__cell {
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 82%, transparent);
    border-radius: 14px;
    background: color-mix(in srgb, var(--ui-background) 74%, transparent);
  }

  .withdrawal-request-card__label {
    color: var(--ui-text-secondary);
    font-size: 12px;
    margin-bottom: 4px;
  }

  .withdrawal-request-card__value {
    color: var(--ui-text-main);
    font-weight: 600;
    line-height: 1.45;
    word-break: break-word;
  }

  .withdrawal-request-card__comment {
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 70%, transparent);
    background: color-mix(in srgb, var(--ui-background) 82%, transparent);
  }

  .withdrawal-request-card__comment--admin {
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
  }

  .withdrawal-request-card__comment-body {
    color: var(--ui-text-main);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .withdrawal-request-card__details-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 78%, transparent);
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background) 78%, transparent);
  }

  .withdrawal-request-card__details-header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .withdrawal-request-card__details-title {
    color: var(--ui-text-main);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.4;
  }

  .withdrawal-request-card__details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 10px;
  }

  .withdrawal-request-card__details-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--ui-background-panel) 65%, transparent);
  }

  .withdrawal-request-card__details-key {
    font-size: 11px;
    color: var(--ui-text-secondary);
    line-height: 1.3;
  }

  .withdrawal-request-card__details-value {
    color: var(--ui-text-main);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.45;
    word-break: break-word;
  }

  .withdrawal-request-card__details-value-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }

  .withdrawal-request-card__details-copy {
    color: var(--ui-text-secondary);
    transition: color 0.2s ease;
  }

  .withdrawal-request-card__details-copy:hover {
    color: var(--ui-primary-main);
  }

  .withdrawal-request-card__details-documents,
  .withdrawal-request-card__details-note {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .withdrawal-request-card__details-document-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .withdrawal-request-card__details-document {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 8px 10px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
    color: var(--ui-text-main);
    font-size: 12px;
    line-height: 1.3;
    word-break: break-word;
  }

  .withdrawal-request-card__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
    align-items: center;
  }

  .withdrawal-request-card__status-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px;
    border-radius: 12px;
    background: var(--color-stroke-ui-dark);
    border: 1px solid var(--color-stroke-ui-light);
  }

  .withdrawal-request-card__status-actions--top {
    justify-content: flex-end;
  }

  .withdrawal-status-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--ui-text-main);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .withdrawal-status-action:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .withdrawal-status-action svg {
    width: 14px;
    height: 14px;
  }

  .withdrawal-status-action :deep(svg path),
  .withdrawal-status-action :deep(svg g),
  .withdrawal-status-action :deep(svg rect),
  .withdrawal-status-action :deep(svg circle) {
    fill: currentColor !important;
    stroke: currentColor !important;
  }

  .withdrawal-status-action:not(:disabled):hover {
    transform: translateY(-1px);
  }

  .withdrawal-status-action--successful:not(:disabled):hover,
  .withdrawal-status-action--successful.is-active {
    background: color-mix(in srgb, #22c55e 22%, transparent);
    border-color: color-mix(in srgb, #22c55e 40%, transparent);
  }

  .withdrawal-status-action--failed:not(:disabled):hover,
  .withdrawal-status-action--failed.is-active,
  .withdrawal-status-action--rejected:not(:disabled):hover,
  .withdrawal-status-action--rejected.is-active,
  .withdrawal-status-action--cancelled:not(:disabled):hover,
  .withdrawal-status-action--cancelled.is-active {
    background: color-mix(in srgb, #ef4444 22%, transparent);
    border-color: color-mix(in srgb, #ef4444 40%, transparent);
  }

  .withdrawal-request-card__edit {
    border-top: 1px solid var(--color-stroke-ui-light);
    padding-top: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .withdrawal-request-card__edit-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .withdrawal-request-card__edit-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .withdrawal-request-card__edit-label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .withdrawal-request-card__edit-error {
    color: var(--ui-sticker-danger);
    font-size: 12px;
  }

  .withdrawal-request-card__textarea {
    width: 100%;
    min-height: 110px;
    resize: vertical;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: var(--ui-control-bg);
    color: var(--ui-text-main);
    padding: 12px;
    outline: none;
  }

  .withdrawal-request-card__edit-loading {
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    .withdrawal-requests-page__toolbar {
      align-items: center;
    }

    .withdrawal-requests-page__toolbar-left {
      max-width: 520px;
    }
  }

  @media (max-width: 767px) {
    .withdrawal-requests-page__toolbar {
      flex-direction: column;
      align-items: stretch;
    }

    .withdrawal-request-card__top {
      flex-direction: column;
    }

    .withdrawal-request-card__side {
      width: 100%;
      align-items: stretch;
      margin-left: 0;
    }

    .withdrawal-request-card__side-head {
      width: 100%;
      justify-content: space-between;
    }

    .withdrawal-request-card__amount {
      white-space: normal;
    }

    .withdrawal-request-card__grid,
    .withdrawal-request-card__edit-grid {
      grid-template-columns: 1fr;
    }

    .withdrawal-request-card__status-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .withdrawal-requests-page__toolbar-right {
      width: 100%;
      justify-content: stretch;
    }

    .withdrawal-requests-page__toolbar-right :deep(.button-default) {
      width: 100%;
    }
  }
</style>
