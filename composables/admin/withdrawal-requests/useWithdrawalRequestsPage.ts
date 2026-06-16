import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { useLocalePath } from "~/.nuxt/imports";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";
import {
  ADMIN_WITHDRAWAL_NOTIFICATION_TYPES,
  type WithdrawalEditForm,
  type WithdrawalPaginatorEvent,
  type WithdrawalPaymentDetailDocument,
  type WithdrawalPaymentDetailEntry,
  type WithdrawalRequestItem,
  type WithdrawalRequestLabels,
  type WithdrawalSelectOption,
  type WithdrawalStats,
  type WithdrawalStatusAction,
} from "./index";

const ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "admin-notifications-marked-by-types";

export function useWithdrawalRequestsPage() {
  const { t } = useI18n({ useScope: "global" });
  const localePath = useLocalePath();
  const toast = useToast();
  const appCore = useAppCore();
  const adminAuthStore = useAdminAuthStore();
  const adminNotificationsStore = useAdminNotificationsStore();

  const requests = ref<WithdrawalRequestItem[]>([]);
  const isLoading = ref(false);
  const isStatsLoading = ref(false);
  const errorMessage = ref("");
  const searchFilter = ref("");
  const statusFilter = ref("pending");
  const page = ref(1);
  const perPage = ref(5);
  const totalRows = ref(0);
  const editingRequestId = ref("");
  const updatingRequestId = ref("");
  const auxiliaryLoadingUserId = ref("");
  const stats = reactive<WithdrawalStats>({
    total: 0,
    pending: 0,
    processing: 0,
    successful: 0,
    failed: 0,
    cancelled: 0,
    rejected: 0,
  });
  const accountOptionsByUserId = reactive<Record<string, WithdrawalSelectOption[]>>({});
  const paymentDetailOptionsByUserId = reactive<Record<string, WithdrawalSelectOption[]>>({});
  const editForm = reactive<WithdrawalEditForm>({
    requestId: "",
    accountId: "",
    paymentDetailId: "",
    amount: "",
    comment: "",
    adminComment: "",
  });
  const editErrors = reactive<Record<string, string>>({});
  const expandedPaymentDetailIds = ref<string[]>([]);
  const notifyClientByRequestId = reactive<Record<string, boolean>>({});

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
  const notifyClientText = computed(() =>
    resolveText("admin.withdrawalRequests.actions.notifyClient", "Notify client")
  );
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

  const labels = computed<WithdrawalRequestLabels>(() => ({
    accountText: accountText.value,
    actionsStatusSelector: resolveText("admin.withdrawalRequests.actions.statusSelector", "Status selector"),
    adminCommentText: adminCommentText.value,
    amountText: amountText.value,
    cancelEditText: cancelEditText.value,
    clientCommentText: clientCommentText.value,
    copyValueText: copyValueText.value,
    createdAtText: createdAtText.value,
    documentsText: documentsText.value,
    editText: editText.value,
    executionText: executionText.value,
    notifyClientText: notifyClientText.value,
    paymentDetailText: paymentDetailText.value,
    paymentMethodText: paymentMethodText.value,
    rejectText: rejectText.value,
    requisitesCommentText: requisitesCommentText.value,
    saveText: saveText.value,
    transferRouteText: transferRouteText.value,
  }));

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

  const ownerInitials = (requestItem: WithdrawalRequestItem): string => {
    const nameParts = String(requestItem.owner_name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const initials = `${nameParts[0]?.charAt(0) ?? ""}${nameParts[1]?.charAt(0) ?? ""}`.toUpperCase();
    if (initials) return initials;

    return String(requestItem.owner_email || "CL")
      .slice(0, 2)
      .toUpperCase();
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

  const paymentDetailEntries = (requestItem: WithdrawalRequestItem): WithdrawalPaymentDetailEntry[] => {
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

  const paymentDetailDocumentHref = (
    document: Pick<WithdrawalPaymentDetailDocument, "path" | "preview_url">
  ): string => {
    const previewUrl = String(document?.preview_url ?? "").trim();
    if (previewUrl !== "") {
      return previewUrl;
    }

    return String(document?.path ?? "").trim();
  };

  const isPaymentDetailDocumentImage = (
    document: Pick<WithdrawalPaymentDetailDocument, "mime_type" | "path" | "preview_url">
  ): boolean => {
    const href = paymentDetailDocumentHref(document);
    if (href === "") {
      return false;
    }

    return String(document?.mime_type ?? "")
      .trim()
      .toLowerCase()
      .startsWith("image/");
  };

  const paymentDetailDocumentExtension = (
    document: Pick<WithdrawalPaymentDetailDocument, "name" | "path" | "mime_type">
  ): string => {
    const name = String(document?.name || document?.path || "").trim();
    const extension = name.includes(".") ? (name.split(".").pop() ?? "") : "";
    const normalizedExtension = extension.trim().toUpperCase();

    if (normalizedExtension !== "") {
      return normalizedExtension.slice(0, 4);
    }

    if (
      String(document?.mime_type ?? "")
        .toLowerCase()
        .includes("pdf")
    ) {
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
    owner_photo_path: String(row?.owner_photo_path ?? row?.owner_photo_url ?? ""),
    owner_is_online: Boolean(row?.owner_is_online),
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
        perPage: perPage.value,
        page: page.value,
        orderBy: "created_at",
        orderDirection: "desc",
        searchFilter: searchFilter.value.trim(),
        filters: statusFilter.value ? { status: statusFilter.value } : {},
      });

      const payload = response?.data?.data ?? {};
      const rows = extractRows(response);
      requests.value = rows.map(normalizeRequest);
      totalRows.value = Number(payload?.total ?? rows.length);
      page.value = Number(payload?.current_page ?? page.value);
      perPage.value = Number(payload?.per_page ?? perPage.value);
      requests.value.forEach(requestItem => {
        if (typeof notifyClientByRequestId[requestItem.id] !== "boolean") {
          notifyClientByRequestId[requestItem.id] = true;
        }
      });
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
      const response = await appCore.adminModules.notifications.markReadByTypes(ADMIN_WITHDRAWAL_NOTIFICATION_TYPES);
      const summary = response?.data?.data ?? {};
      adminNotificationsStore.applySummary(summary);
      useEventBus.emit(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, {
        types: ADMIN_WITHDRAWAL_NOTIFICATION_TYPES,
        summary,
      });
    } catch {
      // Notification read state should not block the operational page.
    }
  };

  const handleSearchInput = async (value: string): Promise<void> => {
    searchFilter.value = value;
    page.value = 1;
    await loadRequests();
  };

  const handleStatCardClick = async (value: string): Promise<void> => {
    statusFilter.value = String(value ?? "");
    page.value = 1;
    await loadRequests();
  };

  const handlePaginatorPage = async (event: WithdrawalPaginatorEvent): Promise<void> => {
    page.value = Number(event.page || 0) + 1;
    perPage.value = Number(event.rows || perPage.value);
    await loadRequests();
  };

  const canEditRequest = (requestItem: WithdrawalRequestItem): boolean =>
    canManagePayments.value &&
    !requestItem.is_internal_transfer &&
    String(requestItem.status).toLowerCase() !== "successful";

  const isStatusActive = (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): boolean => {
    const current = String(requestItem.status).toLowerCase();

    if (nextStatus === "failed" || nextStatus === "rejected") {
      return ["failed", "cancelled", "rejected"].includes(current);
    }

    return current === nextStatus;
  };

  const canMoveToStatus = (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): boolean => {
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

  const isTransferExecuted = (requestItem: WithdrawalRequestItem): boolean =>
    String(requestItem.meta?.transfer_execution?.status ?? "").toLowerCase() === "completed";

  const isStatusDisabled = (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): boolean =>
    updatingRequestId.value === requestItem.id ||
    (isStatusActive(requestItem, nextStatus) &&
      !(requestItem.is_internal_transfer && nextStatus === "successful" && !isTransferExecuted(requestItem))) ||
    !canMoveToStatus(requestItem, nextStatus);

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

  const buildStatusConfirmText = (requestItem: WithdrawalRequestItem, nextStatus: WithdrawalStatusAction): string =>
    requestItem.is_internal_transfer && nextStatus === "successful"
      ? `${resolveText(
          "admin.withdrawalRequests.messages.confirmAutoTransfer",
          "Confirm request and execute MT4 transfer"
        )} #${shortId(requestItem.id)}?`
      : `${resolveText("admin.withdrawalRequests.messages.confirmStatusChange", "Change request")} #${shortId(
          requestItem.id
        )} ${resolveText("admin.withdrawalRequests.messages.confirmStatusChangeTo", "to status")} "${statusText(nextStatus)}"?`;

  const isRejectionStatus = (status: WithdrawalStatusAction): boolean =>
    ["failed", "cancelled", "rejected"].includes(status);

  const resolveStatusUpdateComment = (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction
  ): string | null => {
    if (!isRejectionStatus(nextStatus)) {
      return editingRequestId.value === requestItem.id ? editForm.adminComment.trim() : requestItem.admin_comment;
    }

    const confirmed = typeof window === "undefined" || window.confirm(buildStatusConfirmText(requestItem, nextStatus));
    if (!confirmed) {
      return null;
    }

    if (typeof window === "undefined") {
      return requestItem.admin_comment;
    }

    const comment = window.prompt(
      resolveText(
        "admin.withdrawalRequests.messages.rejectReasonPrompt",
        "Optional rejection reason. Leave empty to skip the comment."
      ),
      editingRequestId.value === requestItem.id ? editForm.adminComment.trim() : requestItem.admin_comment
    );

    return comment === null ? null : comment.trim();
  };

  const handleQuickStatusUpdate = async (
    requestItem: WithdrawalRequestItem,
    nextStatus: WithdrawalStatusAction,
    options: { executeTransfer?: boolean } = {}
  ): Promise<void> => {
    const executeTransfer =
      options.executeTransfer || (requestItem.is_internal_transfer && nextStatus === "successful");

    if (!canManagePayments.value || isStatusDisabled(requestItem, nextStatus)) {
      return;
    }

    const nextAdminComment = resolveStatusUpdateComment(requestItem, nextStatus);
    if (nextAdminComment === null) {
      return;
    }

    if (!isRejectionStatus(nextStatus)) {
      const isConfirmed =
        typeof window === "undefined" || window.confirm(buildStatusConfirmText(requestItem, nextStatus));
      if (!isConfirmed) {
        return;
      }
    }

    updatingRequestId.value = requestItem.id;

    try {
      await appCore.payments.updateWithdrawalRequestStatus(requestItem.id, {
        status: nextStatus,
        admin_comment: nextAdminComment,
        notify_client: notifyClientByRequestId[requestItem.id] !== false,
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

  const handleNotifyClientChange = (requestId: string, value: boolean): void => {
    notifyClientByRequestId[requestId] = value;
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

  const clientLink = (userId: string): string => localePath(`/clients/${userId}`);

  onMounted(async () => {
    await refreshAll();

    if (!errorMessage.value) {
      await markWithdrawalNotificationsSeen();
    }
  });

  return {
    accountOptionsByUserId,
    auxiliaryLoadingUserId,
    canEditRequest,
    canManagePayments,
    clientLink,
    editErrors,
    editForm,
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
    editingRequestId,
  };
}
