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
          <div
            v-for="card in statCards"
            :key="card.id"
            class="withdrawal-stat-card"
          >
            <div class="withdrawal-stat-card__label">{{ card.label }}</div>
            <div class="withdrawal-stat-card__value">{{ card.value }}</div>
          </div>
        </div>

        <div class="withdrawal-requests-page__toolbar">
          <div class="withdrawal-requests-page__toolbar-left">
            <UiInput
              class="w-full"
              :value="searchFilter"
              :placeholder="searchPlaceholder"
              @input="handleSearchInput"
            >
              <template #icon-left>
                <UiIconSearch />
              </template>
            </UiInput>
          </div>

          <div class="withdrawal-requests-page__toolbar-right">
            <UiSelect
              class="min-w-[180px]"
              :without-no-select="true"
              :value="statusFilter"
              :data="statusOptions"
              @change="handleStatusFilterChange"
            />

            <UiButtonDefault state="info--small" class="!w-[44px]" @click="refreshAll">
              <UiIconUpdate :spinning="isLoading || isStatsLoading" />
            </UiButtonDefault>
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="withdrawal-requests-page__error"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="isLoading && requests.length === 0"
          class="withdrawal-requests-page__loading"
        >
          <UiIconSpinnerDefault />
        </div>

        <div
          v-else-if="requests.length === 0"
          class="withdrawal-requests-page__empty"
        >
          {{ emptyText }}
        </div>

        <div
          v-else
          class="withdrawal-requests-list"
        >
          <article
            v-for="requestItem in requests"
            :key="requestItem.id"
            class="withdrawal-request-card"
          >
            <div class="withdrawal-request-card__top">
              <div class="withdrawal-request-card__main">
                <div class="withdrawal-request-card__id-row">
                  <span class="withdrawal-request-card__id">#{{ shortId(requestItem.id) }}</span>
                  <span class="withdrawal-request-card__status" :class="statusClass(requestItem.status)">
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
                      class="withdrawal-request-card__owner-link"
                    >
                      {{ openClientText }}
                    </NuxtLink>
                  </div>
                </div>
              </div>

              <div class="withdrawal-request-card__amount">
                {{ formatMoney(requestItem.amount, requestItem.currency || requestItem.account_currency || "USD") }}
              </div>
            </div>

            <div class="withdrawal-request-card__grid">
              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ accountText }}</div>
                <div class="withdrawal-request-card__value">
                  {{ requestItem.account_number || "-" }}
                  <span v-if="requestItem.account_balance !== undefined">
                    · {{ formatMoney(requestItem.account_balance, requestItem.account_currency || requestItem.currency || "USD") }}
                  </span>
                </div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ paymentMethodText }}</div>
                <div class="withdrawal-request-card__value">{{ requestItem.payment_system_name || "-" }}</div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ paymentDetailText }}</div>
                <div class="withdrawal-request-card__value">{{ requestItem.payment_detail_name || "-" }}</div>
              </div>

              <div class="withdrawal-request-card__cell">
                <div class="withdrawal-request-card__label">{{ createdAtText }}</div>
                <div class="withdrawal-request-card__value">{{ formatDateTime(requestItem.created_at) }}</div>
              </div>
            </div>

            <div
              v-if="requestItem.comment"
              class="withdrawal-request-card__comment"
            >
              <div class="withdrawal-request-card__label">{{ clientCommentText }}</div>
              <div class="withdrawal-request-card__comment-body">{{ requestItem.comment }}</div>
            </div>

            <div
              v-if="requestItem.admin_comment"
              class="withdrawal-request-card__comment withdrawal-request-card__comment--admin"
            >
              <div class="withdrawal-request-card__label">{{ adminCommentText }}</div>
              <div class="withdrawal-request-card__comment-body">{{ requestItem.admin_comment }}</div>
            </div>

            <div class="withdrawal-request-card__actions">
              <UiButtonDefault
                v-if="canMoveToProcessing(requestItem.status)"
                state="success--outline"
                class="withdrawal-request-card__action-btn"
                :disabled="updatingRequestId === requestItem.id"
                @click="handleQuickStatusUpdate(requestItem, 'processing')"
              >
                {{ moveToProcessingText }}
              </UiButtonDefault>

              <UiButtonDefault
                v-if="canMarkSuccessful(requestItem.status)"
                state="success"
                class="withdrawal-request-card__action-btn"
                :disabled="updatingRequestId === requestItem.id"
                @click="handleQuickStatusUpdate(requestItem, 'successful')"
              >
                {{ markSuccessfulText }}
              </UiButtonDefault>

              <UiButtonDefault
                v-if="canMarkFailed(requestItem.status)"
                state="warning"
                class="withdrawal-request-card__action-btn"
                :disabled="updatingRequestId === requestItem.id"
                @click="handleQuickStatusUpdate(requestItem, 'failed')"
              >
                {{ markFailedText }}
              </UiButtonDefault>

              <UiButtonDefault
                v-if="canReject(requestItem.status)"
                state="danger"
                class="withdrawal-request-card__action-btn"
                :disabled="updatingRequestId === requestItem.id"
                @click="handleQuickStatusUpdate(requestItem, 'cancelled')"
              >
                {{ rejectText }}
              </UiButtonDefault>

              <UiButtonDefault
                v-if="canEditRequest(requestItem.status)"
                state="info--outline"
                class="withdrawal-request-card__action-btn"
                :disabled="updatingRequestId === requestItem.id"
                @click="handleToggleEdit(requestItem)"
              >
                {{ editingRequestId === requestItem.id ? cancelEditText : editText }}
              </UiButtonDefault>
            </div>

            <div
              v-if="editingRequestId === requestItem.id"
              class="withdrawal-request-card__edit"
            >
              <div
                v-if="auxiliaryLoadingUserId === requestItem.user_id"
                class="withdrawal-request-card__edit-loading"
              >
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
                      @change="value => handleEditSelectChange('accountId', value)"
                    />
                    <div v-if="editErrors.accountId" class="withdrawal-request-card__edit-error">
                      {{ editErrors.accountId }}
                    </div>
                  </div>

                  <div class="withdrawal-request-card__edit-field">
                    <label class="withdrawal-request-card__edit-label">{{ paymentDetailText }}</label>
                    <UiSelect
                      :without-no-select="true"
                      :value="editForm.paymentDetailId"
                      :data="paymentDetailOptionsByUserId[requestItem.user_id] || []"
                      @change="value => handleEditSelectChange('paymentDetailId', value)"
                    />
                    <div v-if="editErrors.paymentDetailId" class="withdrawal-request-card__edit-error">
                      {{ editErrors.paymentDetailId }}
                    </div>
                  </div>

                  <div class="withdrawal-request-card__edit-field">
                    <label class="withdrawal-request-card__edit-label">{{ amountText }}</label>
                    <UiInput type="number" :value="editForm.amount" @input="value => handleEditInput('amount', value)" />
                    <div v-if="editErrors.amount" class="withdrawal-request-card__edit-error">
                      {{ editErrors.amount }}
                    </div>
                  </div>
                </div>

                <div class="withdrawal-request-card__edit-field">
                  <label class="withdrawal-request-card__edit-label">{{ clientCommentText }}</label>
                  <textarea
                    class="withdrawal-request-card__textarea"
                    :value="editForm.comment"
                    @input="event => handleEditTextarea('comment', event)"
                  />
                </div>

                <div class="withdrawal-request-card__edit-field">
                  <label class="withdrawal-request-card__edit-label">{{ adminCommentText }}</label>
                  <textarea
                    class="withdrawal-request-card__textarea"
                    :value="editForm.adminComment"
                    @input="event => handleEditTextarea('adminComment', event)"
                  />
                </div>

                <div class="withdrawal-request-card__actions">
                  <UiButtonDefault
                    state="info"
                    class="withdrawal-request-card__action-btn"
                    :disabled="updatingRequestId === requestItem.id"
                    @click="handleSaveEdit(requestItem)"
                  >
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
  import useAppCore from "~/composables/useAppCore";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

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
    payment_system_name: string;
    amount: number;
    currency: string;
    status: string;
    comment: string;
    admin_comment: string;
    created_at: string;
  };

  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();

  const requests = ref<WithdrawalRequestItem[]>([]);
  const isLoading = ref(false);
  const isStatsLoading = ref(false);
  const errorMessage = ref("");
  const searchFilter = ref("");
  const statusFilter = ref("");
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

  const resolveText = (key: string, fallback: string): string => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const titleText = computed(() =>
    resolveText("admin.withdrawalRequests.title", "Withdrawal requests")
  );
  const subtitleText = computed(() =>
    resolveText(
      "admin.withdrawalRequests.subtitle",
      "Moderate client payout requests, update statuses and edit payout data before manual processing."
    )
  );
  const searchPlaceholder = computed(() =>
    resolveText("admin.withdrawalRequests.searchPlaceholder", "Search by ID, client, comment or account")
  );
  const emptyText = computed(() =>
    resolveText("admin.withdrawalRequests.empty", "No withdrawal requests found.")
  );
  const accountText = computed(() => resolveText("admin.withdrawalRequests.fields.account", "Account"));
  const paymentMethodText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.paymentMethod", "Payment method")
  );
  const paymentDetailText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.paymentDetail", "Payment details")
  );
  const amountText = computed(() => resolveText("admin.withdrawalRequests.fields.amount", "Amount"));
  const createdAtText = computed(() => resolveText("admin.withdrawalRequests.fields.createdAt", "Created at"));
  const clientCommentText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.clientComment", "Client comment")
  );
  const adminCommentText = computed(() =>
    resolveText("admin.withdrawalRequests.fields.adminComment", "Admin comment")
  );
  const openClientText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.openClient", "Open client")
  );
  const editText = computed(() => resolveText("admin.withdrawalRequests.actions.edit", "Edit"));
  const cancelEditText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.cancelEdit", "Cancel")
  );
  const saveText = computed(() => resolveText("admin.withdrawalRequests.actions.save", "Save"));
  const moveToProcessingText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.processing", "To processing")
  );
  const markSuccessfulText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.successful", "Successful")
  );
  const markFailedText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.failed", "Failed")
  );
  const rejectText = computed(() => resolveText("admin.withdrawalRequests.actions.reject", "Reject"));
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

  const statusOptions = computed(() => [
    { id: "", value: "", text: resolveText("admin.withdrawalRequests.filters.allStatuses", "All statuses") },
    { id: "pending", value: "pending", text: statusText("pending") },
    { id: "processing", value: "processing", text: statusText("processing") },
    { id: "successful", value: "successful", text: statusText("successful") },
    { id: "failed", value: "failed", text: statusText("failed") },
    { id: "cancelled", value: "cancelled", text: statusText("cancelled") },
  ]);

  const statCards = computed(() => [
    { id: "total", label: resolveText("admin.withdrawalRequests.stats.total", "Total"), value: stats.total },
    { id: "pending", label: statusText("pending"), value: stats.pending },
    { id: "processing", label: statusText("processing"), value: stats.processing },
    { id: "successful", label: statusText("successful"), value: stats.successful },
    { id: "failed", label: statusText("failed"), value: stats.failed },
    { id: "cancelled", label: statusText("cancelled"), value: stats.cancelled },
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
    const normalized = String(value ?? "").trim().toLowerCase();
    const key = `admin.withdrawalRequests.statuses.${normalized}`;

    switch (normalized) {
      case "pending":
        return resolveText(key, "Pending");
      case "processing":
        return resolveText(key, "Processing");
      case "successful":
        return resolveText(key, "Successful");
      case "failed":
        return resolveText(key, "Failed");
      case "cancelled":
        return resolveText(key, "Cancelled");
      default:
        return normalized || "-";
    }
  };

  const statusClass = (value: string): string => {
    const normalized = String(value ?? "").trim().toLowerCase();

    if (normalized === "successful") return "is-success";
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
    payment_system_name: String(row?.payment_system_name ?? ""),
    amount: Number(row?.amount ?? 0),
    currency: String(row?.currency ?? ""),
    status: String(row?.status ?? ""),
    comment: String(row?.comment ?? ""),
    admin_comment: String(row?.admin_comment ?? ""),
    created_at: String(row?.created_at ?? ""),
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
    } finally {
      isStatsLoading.value = false;
    }
  };

  const refreshAll = async (): Promise<void> => {
    await Promise.all([loadRequests(), loadStats()]);
  };

  const handleSearchInput = async (value: string): Promise<void> => {
    searchFilter.value = value;
    await loadRequests();
  };

  const handleStatusFilterChange = async (value: string | null): Promise<void> => {
    statusFilter.value = String(value ?? "");
    await loadRequests();
  };

  const canMoveToProcessing = (status: string): boolean =>
    canManagePayments.value && ["pending", "cancelled", "failed", "processing"].includes(String(status).toLowerCase());

  const canMarkSuccessful = (status: string): boolean =>
    canManagePayments.value && ["pending", "processing", "failed"].includes(String(status).toLowerCase());

  const canMarkFailed = (status: string): boolean =>
    canManagePayments.value && ["pending", "processing", "failed"].includes(String(status).toLowerCase());

  const canReject = (status: string): boolean =>
    canManagePayments.value && ["pending", "processing", "failed", "cancelled"].includes(String(status).toLowerCase());

  const canEditRequest = (status: string): boolean =>
    canManagePayments.value && String(status).toLowerCase() !== "successful";

  const handleQuickStatusUpdate = async (
    requestItem: WithdrawalRequestItem,
    nextStatus: "processing" | "successful" | "failed" | "cancelled"
  ): Promise<void> => {
    updatingRequestId.value = requestItem.id;

    try {
      await appCore.payments.updateWithdrawalRequestStatus(requestItem.id, {
        status: nextStatus,
        admin_comment:
          editingRequestId.value === requestItem.id ? editForm.adminComment.trim() : requestItem.admin_comment,
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

      const rawPaymentDetails = Array.isArray(paymentDetailsResponse?.data?.data) ? paymentDetailsResponse.data.data : [];
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

  onMounted(refreshAll);
</script>

<style scoped lang="scss">
  .withdrawal-requests-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: var(--ui-text-main);
  }

  .withdrawal-requests-page__stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .withdrawal-stat-card {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 14px;
    background: var(--ui-background-panel);
    padding: 14px;
  }

  .withdrawal-stat-card__label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .withdrawal-stat-card__value {
    margin-top: 6px;
    font-size: 24px;
    font-weight: 700;
  }

  .withdrawal-requests-page__toolbar {
    display: flex;
    flex-direction: column;
    gap: 10px;
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
    gap: 14px;
  }

  .withdrawal-request-card {
    border: 1px solid var(--color-stroke-ui-light);
    border-radius: 16px;
    background: var(--ui-background-panel);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
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
    gap: 10px;
    margin-bottom: 8px;
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
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
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
    font-size: 18px;
    font-weight: 700;
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

  .withdrawal-request-card__amount {
    font-size: 24px;
    font-weight: 700;
    white-space: nowrap;
  }

  .withdrawal-request-card__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
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
    padding: 12px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--ui-background) 84%, transparent);
  }

  .withdrawal-request-card__comment--admin {
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
  }

  .withdrawal-request-card__comment-body {
    color: var(--ui-text-main);
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .withdrawal-request-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .withdrawal-request-card__action-btn {
    min-width: 140px;
    justify-content: center;
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
    .withdrawal-requests-page__stats {
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .withdrawal-requests-page__toolbar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .withdrawal-requests-page__toolbar-left {
      max-width: 460px;
    }
  }

  @media (max-width: 767px) {
    .withdrawal-request-card__top {
      flex-direction: column;
    }

    .withdrawal-request-card__amount {
      white-space: normal;
    }

    .withdrawal-request-card__grid,
    .withdrawal-request-card__edit-grid {
      grid-template-columns: 1fr;
    }

    .withdrawal-request-card__action-btn {
      width: 100%;
      min-width: 0;
    }

    .withdrawal-requests-page__toolbar-right {
      width: 100%;
      justify-content: stretch;
    }

    .withdrawal-requests-page__toolbar-right :deep(.select),
    .withdrawal-requests-page__toolbar-right :deep(.button-default) {
      width: 100%;
    }
  }
</style>
