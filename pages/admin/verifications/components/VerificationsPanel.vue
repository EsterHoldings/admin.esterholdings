<template>
  <div class="verification-queue-page">
    <section
      class="verification-stat-grid"
      :aria-label="text('admin.verifications.stats.ariaLabel', 'Verification request filters')"
    >
      <PrimeCard
        v-for="card in statCards"
        :key="card.id"
        class="verification-stat-card"
        :class="{ 'is-active': requestStateFilter === card.filter }"
      >
        <template #content>
          <button
            type="button"
            class="verification-stat-card__button"
            @click="handleRequestStateFilter(card.filter)"
          >
            <span class="verification-stat-card__label">{{ card.label }}</span>
            <span class="verification-stat-card__value">{{ card.value }}</span>
            <span class="verification-stat-card__hint">{{ card.hint }}</span>
          </button>
        </template>
      </PrimeCard>
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

      <PrimeSelect
        v-model="sortKey"
        class="verification-toolbar__sort"
        :options="sortOptions"
        option-label="label"
        option-value="value"
        @update:model-value="handleSortChange"
      />

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
      v-if="requestStateFilter !== 'all'"
      class="verification-active-filter"
    >
      <span>{{ text('admin.verifications.filters.active', 'Filter') }}: {{ requestStateText(requestStateFilter) }}</span>
      <button type="button" @click="handleRequestStateFilter('all')">
        {{ text('admin.verifications.filters.reset', 'Reset') }}
      </button>
    </div>

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
              <span
                class="verification-status-line"
                :class="requestStateClass(requestItem.request_state)"
              >
                <i aria-hidden="true" />
                {{ requestStateText(requestItem.request_state) }}
              </span>
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
          <span
            class="verification-status-line verification-status-line--overall"
            :class="statusClass(requestItem.state)"
          >
            <i aria-hidden="true" />
            {{ overallStatusText(requestItem.state) }}
          </span>

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
              @click="handleRequestReviewUpdate(requestItem, 'approved')"
            />
            <PrimeButton
              :label="text('admin.verifications.actions.rejectAll', 'Reject all')"
              icon="pi pi-times"
              size="small"
              severity="danger"
              outlined
              :loading="isUpdating(requestItem.id, 'rejected')"
              :disabled="isUpdating(requestItem.id)"
              @click="handleRequestReviewUpdate(requestItem, 'rejected')"
            />
          </div>
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
type VerificationStatus = "pending" | "approved" | "rejected";
type VerificationSectionTarget = "profile" | "documents" | "payout";
type VerificationTabTarget = "client" | "payout" | "requests";

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

const appCore = useAppCore();
const localePath = useLocalePath();
const toast = useToast();
const { t, te, locale } = useI18n({ useScope: "global" });
const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const ADMIN_NOTIFICATIONS_MARKED_EVENT = "admin-notifications-marked";
const VERIFICATION_NOTIFICATION_TYPE = "verification.request.created";

const page = ref(1);
const perPage = ref(10);
const totalRows = ref(0);
const isLoading = ref(false);
const errorMessage = ref("");
const searchInput = ref("");
const searchFilter = ref("");
const requestStateFilter = ref<"all" | RequestReviewState>("pending");
const sortKey = ref("updated_desc");
const requestItems = ref<VerificationRequestItem[]>([]);
const summary = reactive<Record<string, number>>({
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
});
const updatingState = reactive<Record<string, RequestReviewState | "">>({});
const unreadVerificationNotifications = ref<AdminVerificationUnreadNotification[]>([]);

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

const sortOptions = computed(() => [
  { value: "updated_desc", label: text("admin.verifications.sort.newest", "Newest updated first") },
  { value: "updated_asc", label: text("admin.verifications.sort.oldest", "Oldest updated first") },
  { value: "client_asc", label: text("admin.verifications.sort.clientAsc", "Client name A-Z") },
  { value: "client_desc", label: text("admin.verifications.sort.clientDesc", "Client name Z-A") },
  { value: "request_state", label: text("admin.verifications.sort.state", "Request state") },
]);

const statCards = computed(() => [
  {
    id: "all",
    filter: "all" as const,
    label: text("admin.verifications.stats.all", "All"),
    value: formatCount(summary.all),
    hint: text("admin.verifications.stats.allHint", "All visible requests"),
  },
  {
    id: "pending",
    filter: "pending" as const,
    label: text("admin.verifications.stats.pending", "Unprocessed"),
    value: formatCount(summary.pending),
    hint: text("admin.verifications.stats.pendingHint", "Require admin decision"),
  },
  {
    id: "approved",
    filter: "approved" as const,
    label: text("admin.verifications.stats.approved", "Confirmed"),
    value: formatCount(summary.approved),
    hint: text("admin.verifications.stats.approvedHint", "Approved requests"),
  },
  {
    id: "rejected",
    filter: "rejected" as const,
    label: text("admin.verifications.stats.rejected", "Cancelled"),
    value: formatCount(summary.rejected),
    hint: text("admin.verifications.stats.rejectedHint", "Rejected requests"),
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
  item.userId === userId && (section === undefined || item.section === section)
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
      .filter((item: AdminVerificationUnreadNotification | null): item is AdminVerificationUnreadNotification => Boolean(item));
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

const statusText = (status: VerificationStatus): string => {
  switch (status) {
    case "approved":
      return text("admin.verifications.status.approved", "Approved");
    case "rejected":
      return text("admin.verifications.status.rejected", "Rejected");
    default:
      return text("admin.verifications.status.pending", "Pending");
  }
};

const overallStatusText = (status: VerificationStatus): string => {
  switch (status) {
    case "approved":
      return text("admin.verifications.overall.approved", "Overall approved");
    case "rejected":
      return text("admin.verifications.overall.rejected", "Needs attention");
    default:
      return text("admin.verifications.overall.pending", "In review");
  }
};

const requestStateText = (state: "all" | RequestReviewState): string => {
  switch (state) {
    case "all":
      return text("admin.verifications.requestState.all", "All");
    case "approved":
      return text("admin.verifications.requestState.approved", "Confirmed");
    case "rejected":
      return text("admin.verifications.requestState.rejected", "Cancelled");
    default:
      return text("admin.verifications.requestState.pending", "Unprocessed");
  }
};

const statusClass = (status: VerificationStatus): string => `is-${normalizeVerificationStatus(status)}`;
const requestStateClass = (state: RequestReviewState): string => `is-${normalizeRequestReviewState(state)}`;

const resolveSortPayload = (value: string): { orderBy: string; orderDirection: "asc" | "desc" } => {
  switch (value) {
    case "updated_asc":
      return { orderBy: "updated_at", orderDirection: "asc" };
    case "client_asc":
      return { orderBy: "client_name", orderDirection: "asc" };
    case "client_desc":
      return { orderBy: "client_name", orderDirection: "desc" };
    case "request_state":
      return { orderBy: "request_review_state", orderDirection: "asc" };
    default:
      return { orderBy: "updated_at", orderDirection: "desc" };
  }
};

const loadList = async (): Promise<void> => {
  isLoading.value = true;
  emit("loading", true);
  errorMessage.value = "";

  try {
    const sortPayload = resolveSortPayload(sortKey.value);
    const response = await appCore.adminModules.verificationRequests.getAll({
      page: page.value,
      perPage: perPage.value,
      searchFilter: searchFilter.value,
      requestState: requestStateFilter.value === "all" ? "" : requestStateFilter.value,
      orderBy: sortPayload.orderBy,
      orderDirection: sortPayload.orderDirection,
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

const handleRequestStateFilter = async (value: "all" | RequestReviewState): Promise<void> => {
  requestStateFilter.value = value;
  page.value = 1;
  await loadList();
};

const handleSortChange = async (value: string | null): Promise<void> => {
  sortKey.value = value || "updated_desc";
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

const requestFocusItems = (requestItem: VerificationRequestItem): ReviewFocusItem[] => {
  if (requestItem.request_state !== "pending") {
    return [];
  }

  const items: ReviewFocusItem[] = [];

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

  if (requestItem.requisites_review_count > 0) {
    items.push({
      id: "payout",
      label: text("admin.verifications.changes.requisites", "{count} payment detail(s) changed", {
        count: requestItem.requisites_review_count,
      }),
      tab: "payout",
      section: "payout",
      icon: "pi pi-credit-card",
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

  upsertUnreadVerificationNotification(notification);
  void loadList();
};

const handleMarkedNotifications = (payload?: { ids?: string[] }): void => {
  const ids = Array.isArray(payload?.ids)
    ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean)
    : [];

  removeUnreadVerificationNotifications(ids);
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

  void Promise.all([loadList(), loadUnreadVerificationNotifications()]);
});

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  useEventBus.off(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
});

defineExpose({
  reload: handleRefreshAll,
});
</script>

<style lang="scss" scoped>
.verification-queue-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
}

.verification-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.verification-stat-card {
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.verification-stat-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--ui-primary-main) 42%, var(--color-stroke-ui-light));
}

.verification-stat-card.is-active {
  border-color: var(--ui-primary-main);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 26%, transparent);
}

.verification-stat-card__button {
  display: grid;
  gap: 8px;
  width: 100%;
  min-height: 96px;
  padding: 14px;
  text-align: left;
  color: var(--ui-text-main);
}

.verification-stat-card__label,
.verification-stat-card__hint {
  font-size: 12px;
  color: var(--ui-text-secondary);
}

.verification-stat-card__value {
  font-size: clamp(24px, 4vw, 38px);
  line-height: 0.95;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.verification-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(190px, 260px) auto;
  gap: 10px;
  align-items: center;
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

.verification-toolbar__sort {
  width: 100%;
}

.verification-toolbar__refresh {
  width: 42px;
  height: 42px;
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
  gap: 10px;
}

.verification-request-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px;
  overflow: hidden;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 22px;
  background:
    radial-gradient(circle at top right, color-mix(in srgb, var(--ui-primary-main) 10%, transparent), transparent 32%),
    color-mix(in srgb, var(--ui-background-card) 92%, transparent);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.verification-request-card::after {
  content: "";
  position: absolute;
  inset: -60% auto auto 12%;
  width: 220px;
  height: 220px;
  background: linear-gradient(135deg, transparent, color-mix(in srgb, var(--ui-primary-main) 12%, transparent), transparent);
  opacity: 0;
  transform: rotate(18deg);
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.verification-request-card:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--ui-primary-main) 34%, var(--color-stroke-ui-light));
  box-shadow: 0 18px 42px color-mix(in srgb, #000000 12%, transparent);
}

.verification-request-card:hover::after {
  opacity: 1;
}

.verification-request-card.is-pending-row {
  border-color: color-mix(in srgb, var(--ui-warning-main, #f59e0b) 35%, var(--color-stroke-ui-light));
}

.verification-request-card.is-unread-notification {
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 28%, transparent);
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
  background: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
  font-size: 12px;
  font-weight: 700;
  transition:
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
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
}

.verification-request-card__actions {
  display: flex;
  gap: 8px;
  align-items: center;
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

.verification-status-line--overall {
  white-space: nowrap;
}

@media (max-width: 1180px) {
  .verification-stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .verification-request-card {
    grid-template-columns: 1fr;
  }

  .verification-request-card__side {
    align-items: flex-start;
  }
}

@media (max-width: 760px) {
  .verification-stat-grid,
  .verification-toolbar {
    grid-template-columns: 1fr;
  }

  .verification-request-card__identity {
    flex-direction: column;
  }

  .verification-request-card__actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
