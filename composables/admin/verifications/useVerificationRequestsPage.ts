import { navigateTo, useLocalePath } from "~/.nuxt/imports";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import type {
  AdminVerificationUnreadNotification,
  RequestReviewState,
  RequestScope,
  RequestStateFilter,
  ReviewFocusItem,
  VerificationPanelLabels,
  VerificationPaginatorEvent,
  VerificationRequestItem,
  VerificationRequestNextState,
  VerificationSectionTarget,
  VerificationStatCard,
  VerificationStatus,
  VerificationTabTarget,
} from "~/composables/admin/verifications/types";

const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const ADMIN_NOTIFICATIONS_MARKED_EVENT = "admin-notifications-marked";
const ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "admin-notifications-marked-by-types";
const VERIFICATION_NOTIFICATION_TYPE = "verification.request.created";
const SEARCH_RELOAD_DELAY_MS = 350;

export function useVerificationRequestsPage(requestScope: RequestScope = "identity") {
  const appCore = useAppCore();
  const localePath = useLocalePath();
  const toast = useToast();
  const { t, te, locale } = useI18n({ useScope: "global" });

  const page = ref(1);
  const perPage = ref(10);
  const totalRows = ref(0);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const searchInput = ref("");
  const searchFilter = ref("");
  const requestStateFilter = ref<RequestStateFilter>("pending");
  const requestItems = ref<VerificationRequestItem[]>([]);
  const summary = reactive<Record<string, number>>({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const updatingState = reactive<Record<string, RequestReviewState | "">>({});
  const unreadVerificationNotifications = ref<AdminVerificationUnreadNotification[]>([]);
  const requestReviewDialogSubmitting = ref(false);
  const requestReviewSendNotifications = ref(true);
  const requestReviewDialog = reactive<{
    visible: boolean;
    requestItem: VerificationRequestItem | null;
    nextState: VerificationRequestNextState | null;
  }>({
    visible: false,
    requestItem: null,
    nextState: null,
  });

  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const normalizedRequestScope = computed<RequestScope>(() => (requestScope === "payout" ? "payout" : "identity"));

  function text(key: string, fallback: string, params: Record<string, unknown> = {}): string {
    return te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));
  }

  function localizedFallback(ru: string, uk: string, en: string): string {
    if (locale.value === "ru") return ru;
    if (locale.value === "uk") return uk;

    return en;
  }

  const labels = computed<VerificationPanelLabels>(() => ({
    statsAriaLabel: text("admin.verifications.stats.ariaLabel", "Verification request filters"),
    searchPlaceholder: text("admin.verifications.searchPlaceholder", "Search by client, email or request ID"),
    refreshAriaLabel: text("admin.verifications.actions.refresh", "Refresh"),
    retryLabel: text("admin.verifications.actions.retry", "Retry"),
    emptyList: text("admin.verifications.empty.list", "No verification requests found."),
    noActiveChanges: text("admin.verifications.changes.none", "No active changes marked for review"),
    approveAll: text("admin.verifications.actions.approveAll", "Approve all"),
    rejectAll: text("admin.verifications.actions.rejectAll", "Reject all"),
    sendNotifications: text("admin.verifications.actions.sendNotifications", "Send notifications to client"),
    cancel: text("admin.verifications.actions.cancel", "Cancel"),
  }));

  const statCards = computed<VerificationStatCard[]>(() => [
    {
      id: "pending",
      filter: "pending",
      label: text(
        "admin.verifications.filters.pending",
        localizedFallback("Требующие обработки", "Потребують обробки", "Requires processing")
      ),
      value: formatCount(summary.pending),
    },
    {
      id: "history",
      filter: "history",
      label: text("admin.verifications.filters.history", localizedFallback("История", "Історія", "History")),
      value: formatCount(summary.all),
    },
    {
      id: "approved",
      filter: "approved",
      label: text(
        "admin.verifications.filters.approved",
        localizedFallback("Подтвержденные", "Підтверджені", "Approved")
      ),
      value: formatCount(summary.approved),
    },
    {
      id: "rejected",
      filter: "rejected",
      label: text("admin.verifications.filters.rejected", localizedFallback("Отмененные", "Скасовані", "Cancelled")),
      value: formatCount(summary.rejected),
    },
  ]);

  function normalizeVerificationStatus(value: unknown): VerificationStatus {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "approved" || normalized === "rejected") {
      return normalized;
    }

    return "pending";
  }

  function normalizeRequestReviewState(value: unknown): RequestReviewState {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "approved" || normalized === "rejected") {
      return normalized;
    }

    return "pending";
  }

  function mapNotificationStepToSection(value: unknown): VerificationSectionTarget {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();

    if (normalized === "documents") {
      return "documents";
    }

    if (normalized === "payout") {
      return "payout";
    }

    return "profile";
  }

  function notificationSectionMatchesScope(section: VerificationSectionTarget): boolean {
    if (normalizedRequestScope.value === "payout") {
      return section === "payout";
    }

    return section !== "payout";
  }

  function normalizeUnreadVerificationNotification(raw: any): AdminVerificationUnreadNotification | null {
    const id = String(raw?.id ?? "").trim();
    const type = String(raw?.type ?? "").trim();
    const payload = raw?.payload && typeof raw.payload === "object" ? raw.payload : null;
    const userId = String(payload?.user_id ?? "").trim();
    const readAt = raw?.read_at ? String(raw.read_at).trim() : "";
    const isUnread = raw?.is_unread ?? readAt === "";

    if (id === "" || type !== VERIFICATION_NOTIFICATION_TYPE || userId === "" || !isUnread) {
      return null;
    }

    return {
      id,
      userId,
      section: mapNotificationStepToSection(payload?.step),
    };
  }

  function upsertUnreadVerificationNotification(notification: AdminVerificationUnreadNotification): void {
    const index = unreadVerificationNotifications.value.findIndex(item => item.id === notification.id);
    if (index === -1) {
      unreadVerificationNotifications.value.unshift(notification);
      return;
    }

    unreadVerificationNotifications.value.splice(index, 1, notification);
  }

  function removeUnreadVerificationNotifications(notificationIds: string[]): void {
    if (notificationIds.length === 0) {
      return;
    }

    const idSet = new Set(notificationIds);
    unreadVerificationNotifications.value = unreadVerificationNotifications.value.filter(item => !idSet.has(item.id));
  }

  function hasUnreadVerificationSignal(userId: string, section?: VerificationSectionTarget): boolean {
    return unreadVerificationNotifications.value.some(
      item =>
        item.userId === userId &&
        notificationSectionMatchesScope(item.section) &&
        (section === undefined || item.section === section)
    );
  }

  async function loadUnreadVerificationNotifications(): Promise<void> {
    try {
      const response = await appCore.adminModules.notifications.get({
        page: 1,
        perPage: 100,
      });

      const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
      unreadVerificationNotifications.value = rows
        .map(normalizeUnreadVerificationNotification)
        .filter(
          (item: AdminVerificationUnreadNotification | null): item is AdminVerificationUnreadNotification =>
            item !== null && notificationSectionMatchesScope(item.section)
        );
    } catch {
      unreadVerificationNotifications.value = [];
    }
  }

  function isUpdating(requestId: string, state?: RequestReviewState): boolean {
    if (!state) {
      return Boolean(updatingState[requestId]);
    }

    return updatingState[requestId] === state;
  }

  function displayClientName(requestItem: VerificationRequestItem): string {
    const firstName = String(requestItem.user.first_name ?? "").trim();
    const lastName = String(requestItem.user.last_name ?? "").trim();
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || String(requestItem.user.email ?? "").trim() || requestItem.user_id;
  }

  function displayClientInitials(requestItem: VerificationRequestItem): string {
    const explicit = String(requestItem.user.initials ?? "").trim();
    if (explicit) {
      return explicit;
    }

    const parts = displayClientName(requestItem).split(/\s+/).filter(Boolean);
    const initials = parts
      .slice(0, 2)
      .map(item => item.charAt(0).toUpperCase())
      .join("");

    return initials || "AA";
  }

  function shortId(value: string): string {
    return String(value || "")
      .replace(/-/g, "")
      .slice(0, 10)
      .toUpperCase();
  }

  function formatCount(value: number): string {
    return new Intl.NumberFormat(locale.value || "en").format(Number(value || 0));
  }

  function formatDateTime(value: string | null): string {
    if (!value) {
      return "-";
    }

    const date = new Date(value.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatUpdatedAt(requestItem: VerificationRequestItem): string {
    return requestItem.updated_at ? formatDateTime(requestItem.updated_at) : requestItem.updated_at_human || "-";
  }

  function requestStateText(state: RequestStateFilter | RequestReviewState): string {
    switch (state) {
      case "history":
        return text("admin.verifications.requestState.history", localizedFallback("История", "Історія", "History"));
      case "approved":
        return text("admin.verifications.requestState.approved", "Confirmed");
      case "rejected":
        return text("admin.verifications.requestState.rejected", "Cancelled");
      default:
        return text("admin.verifications.requestState.pending", "Unprocessed");
    }
  }

  async function loadList(): Promise<void> {
    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.adminModules.verificationRequests.getAll({
        page: page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        requestState: requestStateFilter.value === "history" ? "" : requestStateFilter.value,
        requestScope: normalizedRequestScope.value,
        orderBy: "updated_at",
        orderDirection: "desc",
      });

      const payload = response?.data?.data ?? {};
      const paginator = payload?.data ?? {};
      const rows = Array.isArray(paginator?.data) ? paginator.data : [];

      requestItems.value = rows.map((row: any) => ({
        id: String(row?.id ?? ""),
        user_id: String(row?.user_id ?? ""),
        state: normalizeVerificationStatus(row?.state),
        request_state: normalizeRequestReviewState(row?.request_state),
        profile_review_required: Boolean(row?.profile_review_required),
        documents_review_count: Number(row?.documents_review_count ?? 0),
        requisites_review_count: Number(row?.requisites_review_count ?? 0),
        request_viewed_at: row?.request_viewed_at ? String(row.request_viewed_at) : null,
        request_reviewed_at: row?.request_reviewed_at ? String(row.request_reviewed_at) : null,
        updated_at: row?.updated_at ? String(row.updated_at) : null,
        updated_at_human: row?.updated_at_human ? String(row.updated_at_human) : null,
        user: {
          id: row?.user?.id ? String(row.user.id) : null,
          first_name: row?.user?.first_name ? String(row.user.first_name) : null,
          last_name: row?.user?.last_name ? String(row.user.last_name) : null,
          email: row?.user?.email ? String(row.user.email) : null,
          photo_url: row?.user?.photo_url ? String(row.user.photo_url) : null,
          initials: row?.user?.initials ? String(row.user.initials) : null,
          is_online: Boolean(row?.user?.is_online ?? row?.user?.isOnline),
        },
      }));

      totalRows.value = Number(paginator?.total ?? 0);
      Object.assign(summary, {
        all: Number(payload?.summary?.all ?? 0),
        pending: Number(payload?.summary?.pending ?? 0),
        approved: Number(payload?.summary?.approved ?? 0),
        rejected: Number(payload?.summary?.rejected ?? 0),
      });
    } catch (error: any) {
      totalRows.value = 0;
      requestItems.value = [];
      errorMessage.value =
        error?.response?.data?.message ||
        text("admin.verifications.errors.load", "Failed to load verification requests.");
    } finally {
      isLoading.value = false;
    }
  }

  async function handleRequestStateFilter(value: RequestStateFilter): Promise<void> {
    requestStateFilter.value = value;
    page.value = 1;
    await loadList();
  }

  async function handlePaginatorPage(event: VerificationPaginatorEvent): Promise<void> {
    page.value = Number(event.page || 0) + 1;
    perPage.value = Number(event.rows || perPage.value);
    await loadList();
  }

  async function handleRefreshAll(): Promise<void> {
    await Promise.all([loadList(), loadUnreadVerificationNotifications()]);
  }

  async function handleRequestReviewUpdate(
    requestItem: VerificationRequestItem,
    nextState: VerificationRequestNextState
  ): Promise<void> {
    updatingState[requestItem.id] = nextState;

    try {
      await appCore.adminModules.verificationRequests.put(requestItem.id, {
        type: "request",
        requestScope: normalizedRequestScope.value,
        sendNotifications: requestReviewSendNotifications.value,
        updatedStatus: { status: nextState, comment: "" },
      });

      toast.success(text("admin.verifications.messages.updated", "Request status updated."));
      await loadList();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || text("admin.verifications.errors.update", "Failed to update request status.")
      );
    } finally {
      delete updatingState[requestItem.id];
    }
  }

  function openRequestReviewConfirm(
    requestItem: VerificationRequestItem,
    nextState: VerificationRequestNextState
  ): void {
    requestReviewDialog.requestItem = requestItem;
    requestReviewDialog.nextState = nextState;
    requestReviewSendNotifications.value = true;
    requestReviewDialog.visible = true;
  }

  function closeRequestReviewDialog(): void {
    requestReviewDialog.visible = false;
    requestReviewDialog.requestItem = null;
    requestReviewDialog.nextState = null;
  }

  const requestReviewDialogTitle = computed(() =>
    requestReviewDialog.nextState === "approved"
      ? text("admin.verifications.confirm.titleApprove", "Confirm approval")
      : text("admin.verifications.confirm.titleReject", "Confirm rejection")
  );

  const requestReviewDialogMessage = computed(() => {
    if (requestReviewDialog.nextState === "approved") {
      return text(
        "admin.verifications.confirm.requestApprove",
        "Approve all pending verification changes for this client?"
      );
    }

    return text(
      "admin.verifications.confirm.requestReject",
      "Reject all pending verification changes for this client? Pending profile changes will be rolled back."
    );
  });

  async function confirmRequestReviewUpdate(): Promise<void> {
    const requestItem = requestReviewDialog.requestItem;
    const nextState = requestReviewDialog.nextState;

    if (!requestItem || !nextState || requestReviewDialogSubmitting.value) {
      return;
    }

    requestReviewDialogSubmitting.value = true;

    try {
      await handleRequestReviewUpdate(requestItem, nextState);
      requestReviewDialogSubmitting.value = false;
      closeRequestReviewDialog();
    } finally {
      requestReviewDialogSubmitting.value = false;
    }
  }

  function requestFocusItems(requestItem: VerificationRequestItem): ReviewFocusItem[] {
    const items: ReviewFocusItem[] = [];

    if (normalizedRequestScope.value === "payout") {
      items.push({
        id: "payout",
        label:
          requestItem.requisites_review_count > 0
            ? text("admin.verifications.changes.requisites", "{count} payment detail(s) changed", {
                count: requestItem.requisites_review_count,
              })
            : text(
                "admin.verifications.changes.requisitesGeneric",
                localizedFallback(
                  "Запрос по платежным реквизитам",
                  "Запит по платіжних реквізитах",
                  "Payment detail request"
                )
              ),
        tab: "payout",
        section: "payout",
        icon: "pi pi-credit-card",
      });

      return items;
    }

    if (requestItem.profile_review_required) {
      items.push({
        id: "profile",
        label: text("admin.verifications.changes.profile", "Profile data changed"),
        tab: "client",
        section: "profile",
        icon: "pi pi-user-edit",
      });
    }

    if (requestItem.documents_review_count > 0) {
      items.push({
        id: "documents",
        label: text("admin.verifications.changes.documents", "{count} document(s) uploaded", {
          count: requestItem.documents_review_count,
        }),
        tab: "client",
        section: "documents",
        icon: "pi pi-file",
      });
    }

    if (items.length === 0) {
      items.push({
        id: "documents",
        label: text(
          "admin.verifications.changes.identityGeneric",
          localizedFallback(
            "Запрос по документам и профилю",
            "Запит по документах і профілю",
            "Documents and profile request"
          )
        ),
        tab: "client",
        section: "documents",
        icon: "pi pi-id-card",
      });
    }

    return items;
  }

  function resolvePrimaryReviewTarget(requestItem: VerificationRequestItem): {
    tab: VerificationTabTarget;
    section: VerificationSectionTarget | null;
  } {
    const firstFocusItem = requestFocusItems(requestItem)[0];
    if (firstFocusItem) {
      return {
        tab: firstFocusItem.tab,
        section: firstFocusItem.section,
      };
    }

    return {
      tab: "requests",
      section: null,
    };
  }

  function openClientVerification(
    requestItem: VerificationRequestItem,
    tab?: VerificationTabTarget,
    section?: VerificationSectionTarget | null
  ): void {
    const primaryTarget = resolvePrimaryReviewTarget(requestItem);
    const targetTab = tab ?? primaryTarget.tab;
    const targetSection = section ?? primaryTarget.section;
    const query = new URLSearchParams({
      tab: "2",
      verificationTab: targetTab,
    });

    if (targetSection) {
      query.set("verificationSection", targetSection);
    }

    void navigateTo(localePath(`/clients/${requestItem.user_id}?${query.toString()}`));
  }

  function handleAdminNotificationReceived(payload?: { notification?: any }): void {
    const notification = normalizeUnreadVerificationNotification(payload?.notification ?? null);
    if (!notification) {
      return;
    }

    if (!notificationSectionMatchesScope(notification.section)) {
      return;
    }

    upsertUnreadVerificationNotification(notification);
    void loadList();
  }

  function handleMarkedNotifications(payload?: { ids?: string[] }): void {
    const ids = Array.isArray(payload?.ids) ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean) : [];

    removeUnreadVerificationNotifications(ids);
  }

  function handleMarkedNotificationsByTypes(payload?: { types?: string[]; verificationScope?: RequestScope }): void {
    const types = Array.isArray(payload?.types)
      ? payload.types.map(item => String(item ?? "").trim()).filter(Boolean)
      : [];

    if (!types.includes(VERIFICATION_NOTIFICATION_TYPE)) {
      return;
    }

    if (payload?.verificationScope && payload.verificationScope !== normalizedRequestScope.value) {
      return;
    }

    void loadUnreadVerificationNotifications();
  }

  watch(searchInput, value => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    searchTimer = setTimeout(async () => {
      searchFilter.value = value.trim();
      page.value = 1;
      await loadList();
    }, SEARCH_RELOAD_DELAY_MS);
  });

  onMounted(() => {
    useEventBus.on(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
    useEventBus.on(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
    useEventBus.on(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedNotificationsByTypes);

    void Promise.all([loadList(), loadUnreadVerificationNotifications()]);
  });

  onBeforeUnmount(() => {
    if (searchTimer) {
      clearTimeout(searchTimer);
    }

    useEventBus.off(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
    useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
    useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT, handleMarkedNotificationsByTypes);
  });

  return {
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
    closeRequestReviewDialog,
    confirmRequestReviewUpdate,
  };
}
