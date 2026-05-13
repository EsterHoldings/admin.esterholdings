<template>
  <div class="verification-queue-page">
    <section
      class="verification-stat-grid"
      :aria-label="text('admin.verifications.stats.ariaLabel', 'Verification request filters')"
    >
      <button
        v-for="card in statCards"
        :key="card.id"
        type="button"
        class="verification-stat-card"
        :class="{ 'is-active': requestStateFilter === card.filter }"
        @click="handleRequestStateFilter(card.filter)"
      >
        <span class="verification-stat-card__label">{{ card.label }}</span>
        <span class="verification-stat-card__value">{{ card.value }}</span>
      </button>
    </section>

    <section class="verification-toolbar">
      <span class="verification-toolbar__search">
        <i class="pi pi-search" aria-hidden="true" />
        <PrimeInputText
          v-model="searchInput"
          :placeholder="text('admin.verifications.searchPlaceholder', 'Search by client, email or request ID')"
          fluid
        />
      </span>

      <PrimeButton
        class="verification-toolbar__refresh"
        icon="pi pi-refresh"
        rounded
        :loading="isLoading"
        :aria-label="text('admin.verifications.actions.refresh', 'Refresh')"
        @click="handleRefreshAll"
      />
    </section>

    <div
      v-if="isLoading && requestItems.length > 0"
      class="verification-loading-line"
      aria-hidden="true"
    />

    <section
      v-if="errorMessage"
      class="verification-state verification-state--error"
    >
      <span>{{ errorMessage }}</span>
      <PrimeButton
        :label="text('admin.verifications.actions.retry', 'Retry')"
        size="small"
        severity="secondary"
        outlined
        @click="handleRefreshAll"
      />
    </section>

    <section
      v-else-if="isLoading && requestItems.length === 0"
      class="verification-skeleton-list"
    >
      <PrimeSkeleton
        v-for="index in 5"
        :key="`verification-skeleton-${index}`"
        height="108px"
        border-radius="20px"
      />
    </section>

    <section
      v-else-if="requestItems.length === 0"
      class="verification-state"
    >
      {{ text('admin.verifications.empty.list', 'No verification requests found.') }}
    </section>

    <section
      v-else
      class="verification-request-list"
    >
      <article
        v-for="requestItem in requestItems"
        :key="requestItem.id"
        class="verification-request-card"
        :class="{
          'is-pending-row': requestItem.request_state === 'pending',
          'is-unread-notification': hasUnreadVerificationSignal(requestItem.user_id),
        }"
        @click="openClientVerification(requestItem)"
      >
        <div class="verification-request-card__identity">
          <div class="verification-request-card__avatar">
            <img
              v-if="requestItem.user.photo_url"
              :src="requestItem.user.photo_url"
              :alt="displayClientName(requestItem)"
            />
            <span v-else>{{ displayClientInitials(requestItem) }}</span>
          </div>

          <div class="verification-request-card__main">
            <div class="verification-request-card__title-row">
              <h3>{{ displayClientName(requestItem) }}</h3>
            </div>

            <div class="verification-request-card__meta">
              <span>{{ requestItem.user.email || "-" }}</span>
              <span>#{{ shortId(requestItem.id) }}</span>
              <span>{{ formatUpdatedAt(requestItem) }}</span>
            </div>

            <div class="verification-request-card__changes">
              <template v-if="requestFocusItems(requestItem).length">
                <button
                  v-for="item in requestFocusItems(requestItem)"
                  :key="`${requestItem.id}:${item.id}`"
                  type="button"
                  class="verification-change-chip"
                  :class="[
                    `is-${item.section}`,
                    { 'is-unread': hasUnreadVerificationSignal(requestItem.user_id, item.section) },
                  ]"
                  @click.stop="openClientVerification(requestItem, item.tab, item.section)"
                >
                  <i :class="item.icon" aria-hidden="true" />
                  <span>{{ item.label }}</span>
                </button>
              </template>

              <span
                v-else
                class="verification-request-card__no-changes"
              >
                {{ text('admin.verifications.changes.none', 'No active changes marked for review') }}
              </span>
            </div>
          </div>
        </div>

        <div class="verification-request-card__side">
          <div
            v-if="requestItem.request_state === 'pending'"
            class="verification-request-card__actions"
            @click.stop
          >
            <PrimeButton
              :label="text('admin.verifications.actions.approveAll', 'Approve all')"
              icon="pi pi-check"
              size="small"
              severity="success"
              :loading="isUpdating(requestItem.id, 'approved')"
              :disabled="isUpdating(requestItem.id)"
              @click="openRequestReviewConfirm(requestItem, 'approved')"
            />
            <PrimeButton
              :label="text('admin.verifications.actions.rejectAll', 'Reject all')"
              icon="pi pi-times"
              size="small"
              severity="danger"
              outlined
              :loading="isUpdating(requestItem.id, 'rejected')"
              :disabled="isUpdating(requestItem.id)"
              @click="openRequestReviewConfirm(requestItem, 'rejected')"
            />
          </div>
          <span
            class="verification-status-line"
            :class="requestStateClass(requestItem.request_state)"
          >
            <i aria-hidden="true" />
            {{ requestStateText(requestItem.request_state) }}
          </span>
        </div>
      </article>
    </section>

    <PrimePaginator
      v-if="totalRows > 0"
      :first="(page - 1) * perPage"
      :rows="perPage"
      :total-records="totalRows"
      :rows-per-page-options="[5, 10, 20, 50]"
      @page="handlePaginatorPage"
    />

    <PrimeDialog
      v-model:visible="requestReviewDialog.visible"
      modal
      :draggable="false"
      :closable="!requestReviewDialogSubmitting"
      :dismissable-mask="!requestReviewDialogSubmitting"
      class="verification-confirm-dialog"
      :header="requestReviewDialogTitle"
    >
      <div class="verification-confirm-dialog__body">
        <p>{{ requestReviewDialogMessage }}</p>
      </div>

      <template #footer>
        <div class="verification-confirm-dialog__footer">
          <PrimeButton
            severity="secondary"
            text
            :disabled="requestReviewDialogSubmitting"
            :label="text('admin.verifications.actions.cancel', 'Cancel')"
            @click="closeRequestReviewDialog"
          />
          <PrimeButton
            :severity="requestReviewDialog.nextState === 'approved' ? 'success' : 'danger'"
            :loading="requestReviewDialogSubmitting"
            :label="requestReviewDialog.nextState === 'approved'
              ? text('admin.verifications.actions.approveAll', 'Approve all')
              : text('admin.verifications.actions.rejectAll', 'Reject all')"
            @click="confirmRequestReviewUpdate"
          />
        </div>
      </template>
    </PrimeDialog>
  </div>
</template>

<script lang="ts" setup>
import { useLocalePath, navigateTo } from "~/.nuxt/imports";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";

type RequestReviewState = "pending" | "approved" | "rejected";
type RequestStateFilter = "pending" | "history" | "approved" | "rejected";
type VerificationStatus = "pending" | "approved" | "rejected";
type VerificationSectionTarget = "profile" | "documents" | "payout";
type VerificationTabTarget = "client" | "payout" | "requests";
type RequestScope = "identity" | "payout";

interface VerificationRequestItem {
  id: string;
  user_id: string;
  state: VerificationStatus;
  request_state: RequestReviewState;
  profile_review_required: boolean;
  documents_review_count: number;
  requisites_review_count: number;
  request_viewed_at: string | null;
  request_reviewed_at: string | null;
  updated_at: string | null;
  updated_at_human: string | null;
  user: {
    id: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    photo_url: string | null;
    initials: string | null;
  };
}

interface AdminVerificationUnreadNotification {
  id: string;
  userId: string;
  section: VerificationSectionTarget;
}

interface ReviewFocusItem {
  id: VerificationSectionTarget;
  label: string;
  tab: VerificationTabTarget;
  section: VerificationSectionTarget;
  icon: string;
}

const emit = defineEmits<{
  (e: "loading", value: boolean): void;
}>();
const props = withDefaults(
  defineProps<{
    requestScope?: RequestScope;
  }>(),
  {
    requestScope: "identity",
  }
);

const appCore = useAppCore();
const localePath = useLocalePath();
const toast = useToast();
const { t, te, locale } = useI18n({ useScope: "global" });
const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const ADMIN_NOTIFICATIONS_MARKED_EVENT = "admin-notifications-marked";
const ADMIN_NOTIFICATIONS_MARKED_BY_TYPES_EVENT = "admin-notifications-marked-by-types";
const VERIFICATION_NOTIFICATION_TYPE = "verification.request.created";

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
const requestReviewDialog = reactive<{
  visible: boolean;
  requestItem: VerificationRequestItem | null;
  nextState: Exclude<RequestReviewState, "pending"> | null;
}>({
  visible: false,
  requestItem: null,
  nextState: null,
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));
const normalizedRequestScope = computed<RequestScope>(() => (props.requestScope === "payout" ? "payout" : "identity"));
const localizedFallback = (ru: string, uk: string, en: string): string => {
  if (locale.value === "ru") return ru;
  if (locale.value === "uk") return uk;

  return en;
};

const statCards = computed(() => [
  {
    id: "pending",
    filter: "pending" as const,
    label: text("admin.verifications.filters.pending", localizedFallback("Требующие обработки", "Потребують обробки", "Requires processing")),
    value: formatCount(summary.pending),
  },
  {
    id: "history",
    filter: "history" as const,
    label: text("admin.verifications.filters.history", localizedFallback("История", "Історія", "History")),
    value: formatCount(summary.all),
  },
  {
    id: "approved",
    filter: "approved" as const,
    label: text("admin.verifications.filters.approved", localizedFallback("Подтвержденные", "Підтверджені", "Approved")),
    value: formatCount(summary.approved),
  },
  {
    id: "rejected",
    filter: "rejected" as const,
    label: text("admin.verifications.filters.rejected", localizedFallback("Отмененные", "Скасовані", "Cancelled")),
    value: formatCount(summary.rejected),
  },
]);

const normalizeVerificationStatus = (value: unknown): VerificationStatus => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const normalizeRequestReviewState = (value: unknown): RequestReviewState => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const mapNotificationStepToSection = (value: unknown): VerificationSectionTarget => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (normalized === "documents") {
    return "documents";
  }

  if (normalized === "payout") {
    return "payout";
  }

  return "profile";
};

const notificationSectionMatchesScope = (section: VerificationSectionTarget): boolean => {
  if (normalizedRequestScope.value === "payout") {
    return section === "payout";
  }

  return section !== "payout";
};

const normalizeUnreadVerificationNotification = (raw: any): AdminVerificationUnreadNotification | null => {
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
};

const upsertUnreadVerificationNotification = (notification: AdminVerificationUnreadNotification): void => {
  const index = unreadVerificationNotifications.value.findIndex(item => item.id === notification.id);
  if (index === -1) {
    unreadVerificationNotifications.value.unshift(notification);
    return;
  }

  unreadVerificationNotifications.value.splice(index, 1, notification);
};

const removeUnreadVerificationNotifications = (notificationIds: string[]): void => {
  if (notificationIds.length === 0) {
    return;
  }

  const idSet = new Set(notificationIds);
  unreadVerificationNotifications.value = unreadVerificationNotifications.value.filter(item => !idSet.has(item.id));
};

const hasUnreadVerificationSignal = (
  userId: string,
  section?: VerificationSectionTarget,
): boolean => unreadVerificationNotifications.value.some(item =>
  item.userId === userId &&
  notificationSectionMatchesScope(item.section) &&
  (section === undefined || item.section === section)
);

const loadUnreadVerificationNotifications = async (): Promise<void> => {
  try {
    const response = await appCore.adminModules.notifications.get({
      page: 1,
      perPage: 100,
    });

    const rows = Array.isArray(response?.data?.data?.data) ? response.data.data.data : [];
    unreadVerificationNotifications.value = rows
      .map(normalizeUnreadVerificationNotification)
      .filter((item: AdminVerificationUnreadNotification | null): item is AdminVerificationUnreadNotification =>
        item !== null && notificationSectionMatchesScope(item.section)
      );
  } catch {
    unreadVerificationNotifications.value = [];
  }
};

const isUpdating = (requestId: string, state?: RequestReviewState): boolean => {
  if (!state) {
    return Boolean(updatingState[requestId]);
  }

  return updatingState[requestId] === state;
};

const displayClientName = (requestItem: VerificationRequestItem): string => {
  const firstName = String(requestItem.user.first_name ?? "").trim();
  const lastName = String(requestItem.user.last_name ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || String(requestItem.user.email ?? "").trim() || requestItem.user_id;
};

const displayClientInitials = (requestItem: VerificationRequestItem): string => {
  const explicit = String(requestItem.user.initials ?? "").trim();
  if (explicit) {
    return explicit;
  }

  const parts = displayClientName(requestItem).split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(item => item.charAt(0).toUpperCase()).join("");

  return initials || "AA";
};

const shortId = (value: string): string => String(value || "").replace(/-/g, "").slice(0, 10).toUpperCase();

const formatCount = (value: number): string => new Intl.NumberFormat(locale.value || "en").format(Number(value || 0));

const formatDateTime = (value: string | null): string => {
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
};

const formatUpdatedAt = (requestItem: VerificationRequestItem): string =>
  requestItem.updated_at ? formatDateTime(requestItem.updated_at) : (requestItem.updated_at_human || "-");

const requestStateText = (state: RequestStateFilter | RequestReviewState): string => {
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
};

const requestStateClass = (state: RequestReviewState): string => `is-${normalizeRequestReviewState(state)}`;

const loadList = async (): Promise<void> => {
  isLoading.value = true;
  emit("loading", true);
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
    errorMessage.value = error?.response?.data?.message || text("admin.verifications.errors.load", "Failed to load verification requests.");
  } finally {
    isLoading.value = false;
    emit("loading", false);
  }
};

const handleRequestStateFilter = async (value: RequestStateFilter): Promise<void> => {
  requestStateFilter.value = value;
  page.value = 1;
  await loadList();
};

const handlePaginatorPage = async (event: { page: number; rows: number }): Promise<void> => {
  page.value = Number(event.page || 0) + 1;
  perPage.value = Number(event.rows || perPage.value);
  await loadList();
};

const handleRefreshAll = async (): Promise<void> => {
  await Promise.all([loadList(), loadUnreadVerificationNotifications()]);
};

const handleRequestReviewUpdate = async (
  requestItem: VerificationRequestItem,
  nextState: Exclude<RequestReviewState, "pending">
): Promise<void> => {
  updatingState[requestItem.id] = nextState;

  try {
    await appCore.adminModules.verificationRequests.put(requestItem.id, {
      type: "request",
      requestScope: normalizedRequestScope.value,
      updatedStatus: { status: nextState, comment: "" },
    });

    toast.success(text("admin.verifications.messages.updated", "Request status updated."));
    await loadList();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || text("admin.verifications.errors.update", "Failed to update request status."));
  } finally {
    delete updatingState[requestItem.id];
  }
};

const openRequestReviewConfirm = (
  requestItem: VerificationRequestItem,
  nextState: Exclude<RequestReviewState, "pending">
): void => {
  requestReviewDialog.requestItem = requestItem;
  requestReviewDialog.nextState = nextState;
  requestReviewDialog.visible = true;
};

const closeRequestReviewDialog = (): void => {
  requestReviewDialog.visible = false;
  requestReviewDialog.requestItem = null;
  requestReviewDialog.nextState = null;
};

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

const confirmRequestReviewUpdate = async (): Promise<void> => {
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
};

const requestFocusItems = (requestItem: VerificationRequestItem): ReviewFocusItem[] => {
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
              localizedFallback("Запрос по платежным реквизитам", "Запит по платіжних реквізитах", "Payment detail request")
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
        localizedFallback("Запрос по документам и профилю", "Запит по документах і профілю", "Documents and profile request")
      ),
      tab: "client",
      section: "documents",
      icon: "pi pi-id-card",
    });
  }

  return items;
};

const resolvePrimaryReviewTarget = (
  requestItem: VerificationRequestItem
): { tab: VerificationTabTarget; section: VerificationSectionTarget | null } => {
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
};

const openClientVerification = (
  requestItem: VerificationRequestItem,
  tab?: VerificationTabTarget,
  section?: VerificationSectionTarget | null,
): void => {
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

  navigateTo(localePath(`/clients/${requestItem.user_id}?${query.toString()}`));
};

const handleAdminNotificationReceived = (payload?: { notification?: any }): void => {
  const notification = normalizeUnreadVerificationNotification(payload?.notification ?? null);
  if (!notification) {
    return;
  }

  if (!notificationSectionMatchesScope(notification.section)) {
    return;
  }

  upsertUnreadVerificationNotification(notification);
  void loadList();
};

const handleMarkedNotifications = (payload?: { ids?: string[] }): void => {
  const ids = Array.isArray(payload?.ids)
    ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean)
    : [];

  removeUnreadVerificationNotifications(ids);
};

const handleMarkedNotificationsByTypes = (payload?: {
  types?: string[];
  verificationScope?: RequestScope;
}): void => {
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
};

watch(searchInput, value => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = setTimeout(async () => {
    searchFilter.value = value.trim();
    page.value = 1;
    await loadList();
  }, 350);
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

defineExpose({
  reload: handleRefreshAll,
});
</script>

<style lang="scss" scoped>
.verification-queue-page {
  --verification-line: color-mix(in srgb, var(--ui-primary-main) 18%, var(--color-stroke-ui-light));

  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

.verification-stat-grid {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.verification-stat-card {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 7px 12px;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 999px;
  color: var(--ui-text-secondary);
  background: transparent;
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background-color 0.18s ease;
}

.verification-stat-card:hover {
  border-color: color-mix(in srgb, var(--ui-primary-main) 42%, var(--color-stroke-ui-light));
  color: var(--ui-text-main);
}

.verification-stat-card.is-active {
  border-color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 10%, transparent);
  color: var(--ui-text-main);
}

.verification-stat-card__label {
  font-size: 12px;
  font-weight: 800;
}

.verification-stat-card__value {
  min-width: 18px;
  font-size: 13px;
  line-height: 1;
  font-weight: 800;
}

.verification-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 0;
  background: transparent;
}

.verification-toolbar__search {
  position: relative;
  display: flex;
  align-items: center;
}

.verification-toolbar__search > i {
  position: absolute;
  left: 14px;
  z-index: 1;
  color: var(--ui-text-secondary);
}

.verification-toolbar__search :deep(.p-inputtext) {
  width: 100%;
  padding-left: 40px;
}

.verification-toolbar__refresh {
  width: 42px;
  height: 42px;
}

.verification-loading-line {
  position: relative;
  height: 2px;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
}

.verification-loading-line::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 36%;
  border-radius: inherit;
  background: var(--ui-primary-main);
  animation: verification-loading-line 1.05s ease-in-out infinite;
}

.verification-active-filter,
.verification-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--ui-text-main);
}

.verification-active-filter {
  padding: 0 2px;
  color: var(--ui-text-secondary);
  font-size: 13px;
}

.verification-active-filter button {
  color: var(--ui-primary-main);
  font-weight: 700;
}

.verification-state {
  justify-content: center;
  min-height: 120px;
  padding: 18px;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 20px;
  background: color-mix(in srgb, var(--ui-background-card) 88%, transparent);
}

.verification-state--error {
  justify-content: space-between;
}

.verification-skeleton-list,
.verification-request-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.verification-request-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: flex-start;
  padding: 18px 0 18px 28px;
  border-bottom: 1px solid var(--color-stroke-ui-light);
  background: transparent;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.verification-request-card::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 8px;
  width: 1px;
  background: var(--verification-line);
  pointer-events: none;
}

.verification-request-card::before {
  content: "";
  position: absolute;
  top: 30px;
  left: 3px;
  z-index: 1;
  width: 11px;
  height: 11px;
  border: 2px solid var(--ui-background-admin);
  border-radius: 999px;
  background: var(--ui-primary-main);
}

.verification-request-card:hover {
  border-color: color-mix(in srgb, var(--ui-primary-main) 26%, var(--color-stroke-ui-light));
  background: color-mix(in srgb, var(--ui-primary-main) 4%, transparent);
}

.verification-request-card.is-pending-row {
  border-color: color-mix(in srgb, var(--ui-warning-main, #f59e0b) 28%, var(--color-stroke-ui-light));
}

.verification-request-card.is-pending-row::before {
  background: var(--ui-warning-main, #f59e0b);
}

.verification-request-card.is-unread-notification {
  background: color-mix(in srgb, var(--ui-primary-main) 6%, transparent);
}

.verification-request-card__identity {
  display: flex;
  gap: 12px;
  min-width: 0;
}

.verification-request-card__avatar {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--ui-primary-main), color-mix(in srgb, var(--ui-primary-main) 60%, #000000));
}

.verification-request-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-request-card__main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.verification-request-card__title-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.verification-request-card__title-row h3 {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
  color: var(--ui-text-main);
}

.verification-request-card__meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.verification-request-card__changes {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.verification-change-chip {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  min-height: 30px;
  padding: 6px 10px;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 999px;
  color: var(--ui-text-main);
  background: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
  font-size: 12px;
  font-weight: 700;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

@keyframes verification-loading-line {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(320%);
  }
}

.verification-change-chip:hover {
  transform: translateY(-1px);
  border-color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 12%, var(--ui-background-panel));
}

.verification-change-chip.is-unread {
  border-color: var(--ui-primary-main);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 20%, transparent);
}

.verification-request-card__no-changes {
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.verification-request-card__side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
  justify-content: flex-start;
  min-width: 210px;
}

.verification-request-card__actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.verification-status-line {
  display: inline-flex;
  gap: 7px;
  align-items: center;
  color: var(--ui-text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.verification-status-line i {
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentColor;
}

.verification-status-line.is-approved {
  color: var(--ui-success-main, #22c55e);
}

.verification-status-line.is-rejected {
  color: var(--ui-danger-main, #ef4444);
}

.verification-status-line.is-pending {
  color: var(--ui-warning-main, #f59e0b);
}

:deep(.verification-confirm-dialog) {
  width: min(100%, 460px);
}

:deep(.verification-confirm-dialog .p-dialog-header) {
  padding-bottom: 0;
}

:deep(.verification-confirm-dialog .p-dialog-content) {
  padding-top: 12px;
}

.verification-confirm-dialog__body p {
  color: var(--ui-text-main);
  font-size: 14px;
  line-height: 1.5;
}

.verification-confirm-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}

:deep(.p-paginator) {
  justify-content: flex-start;
  padding: 10px 0 0;
  border: 0;
  background: transparent;
}

:deep(.p-paginator .p-paginator-page),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-last),
:deep(.p-paginator .p-select) {
  box-shadow: none;
}

@media (max-width: 1180px) {
  .verification-request-card {
    grid-template-columns: 1fr;
  }

  .verification-request-card__side {
    align-items: flex-start;
  }
}

@media (max-width: 760px) {
  .verification-toolbar {
    grid-template-columns: 1fr;
  }

  .verification-stat-grid {
    align-items: stretch;
  }

  .verification-stat-card {
    flex: 1 1 calc(50% - 8px);
    justify-content: center;
  }

  .verification-request-card__identity {
    flex-direction: column;
  }

  .verification-request-card__side {
    min-width: 0;
    align-items: stretch;
  }

  .verification-request-card__actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
