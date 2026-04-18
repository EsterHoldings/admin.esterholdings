<template>
  <div class="client-verification">
    <div class="client-verification__header">
      <div>
        <h2>{{ text("admin.verifications.clientTimeline.title", "Verification timeline") }}</h2>
        <p>
          {{
            text(
              "admin.verifications.clientTimeline.subtitle",
              "Every profile, document and payment-detail change is shown as a separate review item."
            )
          }}
        </p>
      </div>

      <div class="client-verification__header-actions">
        <span
          class="verification-inline-status"
          :class="hasPendingRequests ? 'verification-inline-status--warning' : 'verification-inline-status--success'">
          <span class="verification-inline-status__dot" />
          <span>
            {{
              hasPendingRequests
                ? text("admin.verifications.clientTimeline.hasPending", "Pending review")
                : text("admin.verifications.clientTimeline.noPending", "No pending review")
            }}
          </span>
        </span>

        <PrimeButton
          icon="pi pi-refresh"
          rounded
          text
          :loading="isAnyLoading"
          :aria-label="text('admin.verifications.actions.refresh', 'Refresh')"
          @click="handleRefreshAll" />
      </div>
    </div>

    <div class="client-verification__summary-grid">
      <PrimeCard
        v-for="card in verificationSummaryCards"
        :key="card.id"
        class="verification-summary-card"
        :class="[
          `verification-summary-card--${card.kind}`,
          { 'is-active': activeTimelineSectionFilter === card.filter },
        ]"
        role="button"
        tabindex="0"
        @click="setTimelineSectionFilter(card.filter)"
        @keydown.enter.prevent="setTimelineSectionFilter(card.filter)"
        @keydown.space.prevent="setTimelineSectionFilter(card.filter)">
        <template #content>
          <div class="verification-summary-card__body">
            <span class="verification-summary-card__label">{{ card.label }}</span>
            <strong class="verification-summary-card__value">{{ card.value }}</strong>
            <span class="verification-summary-card__hint">{{ card.hint }}</span>
          </div>
        </template>
      </PrimeCard>
    </div>

    <div class="verification-filter-strip">
      <PrimeButton
        v-for="option in timelineStatusFilterOptions"
        :key="option.value"
        type="button"
        size="small"
        :icon="option.icon"
        :label="option.label"
        :outlined="activeTimelineStatusFilter !== option.value"
        :severity="option.severity"
        class="verification-status-filter-button"
        :class="{ 'is-active': activeTimelineStatusFilter === option.value }"
        @click="setTimelineStatusFilter(option.value)" />
    </div>

    <div class="client-verification__anchors" aria-hidden="true">
      <span ref="profileSectionRef" />
      <span ref="documentsSectionRef" />
      <span ref="payoutSectionRef" />
    </div>

    <div
      v-if="isInitialTimelineLoading"
      class="verification-timeline">
      <PrimeCard
        v-for="item in 4"
        :key="`verification-timeline-skeleton-${item}`"
        class="verification-timeline-card verification-timeline-card--skeleton">
        <template #content>
          <div class="verification-timeline-card__inner">
            <div class="verification-timeline-card__top">
              <PrimeSkeleton shape="circle" size="40px" />
              <div class="verification-timeline-card__main">
                <PrimeSkeleton width="52%" height="18px" border-radius="8px" />
                <PrimeSkeleton width="74%" height="12px" border-radius="999px" />
              </div>
              <PrimeSkeleton width="92px" height="26px" border-radius="999px" />
            </div>
            <PrimeSkeleton height="92px" border-radius="16px" />
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimeCard
      v-else-if="visibleVerificationTimelineItems.length === 0"
      class="verification-empty-card">
      <template #content>
        <div class="verification-empty-card__body">
          <i class="pi pi-check-circle" />
          <strong>{{ text("admin.verifications.clientTimeline.emptyTitle", "No verification activity yet") }}</strong>
          <span>{{ text("admin.verifications.clientTimeline.emptySubtitle", "Client changes and admin actions will appear here.") }}</span>
        </div>
      </template>
    </PrimeCard>

    <div
      v-else
      class="verification-timeline">
      <PrimeCard
        v-for="item in visibleVerificationTimelineItems"
        :key="item.id"
        class="verification-timeline-card"
        :class="[
          `verification-timeline-card--${item.kind}`,
          `is-${item.status}`,
          {
            'is-actionable': item.actionable,
            'is-highlighted': highlightedSection === item.section,
            'is-unread': item.unread,
          },
        ]">
        <template #content>
          <div class="verification-timeline-card__inner">
            <div class="verification-timeline-card__top">
              <div class="verification-timeline-card__identity">
                <div class="verification-timeline-card__icon">
                  <i :class="item.icon" />
                </div>

                <div class="verification-timeline-card__main">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                  <div class="verification-timeline-card__meta">
                    <span>{{ item.actor }}</span>
                    <span>{{ item.date || "-" }}</span>
                    <span v-if="item.requestId">#{{ shortId(item.requestId) }}</span>
                  </div>
                </div>
              </div>

              <div class="verification-timeline-card__review">
                <div class="verification-timeline-card__status">
                  <span
                    class="verification-inline-status"
                    :class="`verification-inline-status--${item.status}`">
                    <span class="verification-inline-status__dot" />
                    <span>{{ item.statusText }}</span>
                  </span>
                </div>

                <div
                  v-if="item.actionable"
                  class="verification-decision-group"
                  role="group"
                  :aria-label="text('admin.verifications.actions.chooseDecision', 'Choose decision')">
                  <PrimeButton
                    type="button"
                    size="small"
                    icon="pi pi-check"
                    :label="text('admin.verifications.actions.approve', 'Approve')"
                    severity="success"
                    :loading="isTimelineItemUpdating(item)"
                    :disabled="isTimelineItemUpdating(item) || isRequestUpdating(item.requestId)"
                    @click="handleTimelineDecisionClick(item, 'approved')" />
                  <PrimeButton
                    type="button"
                    size="small"
                    icon="pi pi-times"
                    :label="text('admin.verifications.actions.reject', 'Reject')"
                    severity="danger"
                    :disabled="isTimelineItemUpdating(item) || isRequestUpdating(item.requestId)"
                    @click="handleTimelineDecisionClick(item, 'rejected')" />
                </div>
              </div>
            </div>

            <div
              v-if="item.changes.length"
              class="verification-change-grid">
              <div
                v-for="change in item.changes"
                :key="`${item.id}:${change.field}`"
                class="verification-change-row">
                <span class="verification-change-row__field">{{ profileFieldLabel(change.field) }}</span>
                <span class="verification-change-row__value is-old">{{ formatHistoryValue(change.old) }}</span>
                <i class="pi pi-arrow-right" />
                <span class="verification-change-row__value is-new">{{ formatHistoryValue(change.new) }}</span>
              </div>
            </div>

            <div
              v-if="item.fields.length"
              class="verification-field-grid">
              <div
                v-for="field in item.fields"
                :key="`${item.id}:field:${field.key}`"
                class="verification-field-card">
                <span>{{ field.label }}</span>
                <strong>{{ field.value || "-" }}</strong>
              </div>
            </div>

            <div
              v-if="item.documents.length"
              class="verification-document-strip">
              <button
                v-for="document in item.documents"
                :key="`${item.id}:document:${document.id}`"
                type="button"
                class="verification-document-chip"
                :class="`is-${document.preview.type}`"
                @click="openTimelineDocument(document)">
                <img
                  v-if="document.preview.type === 'image' && document.preview.src"
                  :src="document.preview.src"
                  :alt="document.label" />
                <span
                  v-else
                  class="verification-file-badge"
                  :class="`is-${document.preview.type}`">
                  {{ document.preview.label }}
                </span>
                <span>{{ document.label }}</span>
              </button>
            </div>

          </div>
        </template>
      </PrimeCard>

      <button
        v-if="hasMoreVerificationTimeline"
        type="button"
        class="verification-timeline__load"
        @click="loadMoreVerificationHistory">
        {{ text("admin.verifications.history.loadMore", "Load more") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";
import VerificationRequestStateActions from "~/components/block/verification/VerificationRequestStateActions.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiFormControl from "~/components/ui/UiFormControl.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextarea from "~/components/ui/UiTextarea.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useAdminNotificationsStore } from "~/stores/adminNotificationsStore";

type VerificationTab = "client" | "payout" | "requests";
type VerificationSectionTarget = "profile" | "documents" | "payout";
type VerificationStatus = "approved" | "pending" | "rejected";
type RequestReviewState = "pending" | "approved" | "rejected";
type AdminPaymentDetailStatus = "approved" | "pending" | "rejected";
type VerificationTimelineSectionFilter = "all" | VerificationTimelineKind | "history";
type VerificationTimelineStatusFilter = "all" | VerificationStatus;

interface VerificationSection {
  verification_status: string;
  comment: string;
}

interface VerificationRequestDto {
  info: VerificationSection;
  email: VerificationSection;
  photo: VerificationSection;
  documents: VerificationSection;
  deposit: VerificationSection;
}

interface VerificationDocumentItem {
  id: string;
  name: string;
  state: VerificationStatus;
  comment: string;
  document_data: {
    number: string;
    full_url: string;
  };
}

interface AdminPaymentDetailDocument {
  name: string;
  path: string;
  mimeType: string;
  size: number | null;
  previewUrl: string;
}

interface AdminPaymentDetailItem {
  id: string;
  name: string;
  status: AdminPaymentDetailStatus;
  paymentSystemName: string;
  updatedAt: string;
  deletedAt: string;
  isArchived: boolean;
  adminComment: string;
  data: Record<string, unknown>;
  documents: AdminPaymentDetailDocument[];
}

interface PaymentRow {
  id: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  created_at: string;
  payment_gateway: string;
  payment_system_name: string;
  legacy_payment_system_name: string;
}

interface ClientVerificationRequestRow {
  id: string;
  user_id: string;
  state: VerificationStatus;
  request_state: RequestReviewState;
  profile_review_required: boolean;
  documents_review_count: number;
  requisites_review_count: number;
  updated_at: string | null;
  updated_at_human: string | null;
}

interface VerificationHistoryRow {
  id: string;
  key: string;
  name: string;
  date: string;
  status: VerificationStatus;
  actor: {
    id: string;
    type: string;
    name: string;
  };
  data: Record<string, any>;
}

interface VerificationHistoryChange {
  field: string;
  old: unknown;
  new: unknown;
}

type VerificationPreviewKind = "image" | "pdf" | "text" | "file";

interface VerificationPreviewMeta {
  type: VerificationPreviewKind;
  src: string;
  label: string;
}

type VerificationTimelineKind = "profile" | "documents" | "payout" | "system";
type VerificationTimelineAction = "profile" | "document" | "payout" | null;

interface VerificationTimelineField {
  key: string;
  label: string;
  value: string;
}

interface VerificationTimelineDocument {
  id: string;
  label: string;
  url: string;
  preview: VerificationPreviewMeta;
  paymentDetailId?: string;
  paymentDetailDocumentIndex?: number;
}

interface VerificationTimelineItem {
  id: string;
  kind: VerificationTimelineKind;
  section: VerificationSectionTarget;
  status: VerificationStatus;
  statusText: string;
  icon: string;
  title: string;
  description: string;
  actor: string;
  date: string;
  sortTime: number;
  requestId: string;
  actionable: boolean;
  actionType: VerificationTimelineAction;
  actionId: string;
  changes: VerificationHistoryChange[];
  fields: VerificationTimelineField[];
  documents: VerificationTimelineDocument[];
  unread: boolean;
}

interface AdminVerificationUnreadNotification {
  id: string;
  userId: string;
  section: VerificationSectionTarget;
}

const initialData: VerificationRequestDto = {
  info: { verification_status: "pending", comment: "" },
  email: { verification_status: "pending", comment: "" },
  photo: { verification_status: "pending", comment: "" },
  documents: { verification_status: "pending", comment: "" },
  deposit: { verification_status: "pending", comment: "" },
};

const props = defineProps({
  userData: {
    type: Object,
    default: () => ({}),
  },
  clientId: {
    type: String,
    required: false,
  },
});

const appCore = useAppCore();
const adminAuthStore = useAdminAuthStore();
const adminNotificationsStore = useAdminNotificationsStore();
const route = useRoute();
const toast = useToast();
const { t, te } = useI18n({ useScope: "global" });
const ADMIN_NOTIFICATION_RECEIVED_EVENT = "admin-notification-received";
const ADMIN_NOTIFICATIONS_MARKED_EVENT = "admin-notifications-marked";
const VERIFICATION_NOTIFICATION_TYPE = "verification.request.created";

const isLoading = ref(false);
const isPayoutLoading = ref(false);
const isRequestsLoading = ref(false);
const activeVerificationTab = ref<VerificationTab>("client");
const payoutArchivedFilter = ref<"active" | "archived" | "all">("active");

const verificationRequestData = reactive<VerificationRequestDto>({ ...initialData });
const documentsListRequestData = ref<VerificationDocumentItem[]>([]);
const payoutDetails = ref<AdminPaymentDetailItem[]>([]);
const firstDeposit = ref<PaymentRow | null>(null);
const clientRequestRows = ref<ClientVerificationRequestRow[]>([]);
const verificationHistoryRows = ref<VerificationHistoryRow[]>([]);
const verificationHistoryVisibleCount = ref(10);
const requestUpdatingState = reactive<Record<string, boolean>>({});
const timelineUpdatingState = reactive<Record<string, boolean>>({});
const highlightedSection = ref<VerificationSectionTarget | null>(null);
const activeTimelineSectionFilter = ref<VerificationTimelineSectionFilter>("all");
const activeTimelineStatusFilter = ref<VerificationTimelineStatusFilter>("all");
const profileSectionRef = ref<HTMLElement | null>(null);
const documentsSectionRef = ref<HTMLElement | null>(null);
const payoutSectionRef = ref<HTMLElement | null>(null);

const infoStatus = ref<VerificationStatus>("pending");
const infoComment = ref("");
const documentsStatus = ref<VerificationStatus>("pending");
const documentsComment = ref("");
const isInfoCommentOpen = ref(false);
const infoCommentDraft = ref("");
const isDocumentsCommentOpen = ref(false);
const documentsCommentDraft = ref("");
const payoutDocumentLoadingMap = reactive<Record<string, boolean>>({});
const payoutCommentOpenMap = reactive<Record<string, boolean>>({});
const payoutCommentDraftMap = reactive<Record<string, string>>({});
const unreadVerificationNotifications = ref<AdminVerificationUnreadNotification[]>([]);
const seenTabs = reactive<Record<VerificationTab, boolean>>({
  client: false,
  payout: false,
  requests: false,
});

const canUpdateVerifications = computed(
  () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("update-verifications")
);

const canUpdatePaymentDetails = computed(
  () =>
    adminAuthStore.hasRole("super-admin")
    || adminAuthStore.hasPermission("update-client-payment-details")
    || adminAuthStore.hasPermission("update-clients")
);

const payoutArchivedFilterOptions = computed(() => [
  { value: "active" as const, label: text("admin.verifications.payout.filters.active", "Active") },
  { value: "archived" as const, label: text("admin.verifications.payout.filters.archived", "Archived") },
  { value: "all" as const, label: text("admin.verifications.payout.filters.all", "All") },
]);

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

const normalizeVerificationStatus = (value: unknown): VerificationStatus => {
  if (typeof value !== "string") {
    return "pending";
  }

  const status = value.trim().toLowerCase();
  if (status === "approved" || status === "rejected") {
    return status;
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

const normalizePaymentStatus = (value: unknown): AdminPaymentDetailStatus => {
  if (typeof value !== "string") {
    return "pending";
  }

  const status = value.trim().toLowerCase();
  if (status === "approved" || status === "rejected") {
    return status;
  }

  return "pending";
};

const normalizePayoutDocuments = (value: unknown): AdminPaymentDetailDocument[] => {
  const rawItems: unknown[] = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null
      ? Object.values(value as Record<string, unknown>)
      : [];

  return rawItems
    .map(item => {
      if (typeof item !== "object" || item === null) {
        return null;
      }

      const row = item as Record<string, any>;
      const path = String(row.path ?? "");
      if (!path) {
        return null;
      }

      return {
        name: String(row.name ?? ""),
        path,
        mimeType: String(row.mime_type ?? row.mimeType ?? ""),
        size: typeof row.size === "number" ? row.size : null,
        previewUrl: String(row.preview_url ?? row.previewUrl ?? ""),
      };
    })
    .filter((item): item is AdminPaymentDetailDocument => Boolean(item));
};

const normalizeClientRequests = (payload: any): ClientVerificationRequestRow[] => {
  const rows = Array.isArray(payload?.data?.data) ? payload.data.data : [];

  return rows.map((row: any) => ({
    id: String(row?.id ?? ""),
    user_id: String(row?.user_id ?? ""),
    state: normalizeVerificationStatus(row?.state),
    request_state: normalizeRequestReviewState(row?.request_state),
    profile_review_required: Boolean(row?.profile_review_required),
    documents_review_count: Number(row?.documents_review_count ?? 0),
    requisites_review_count: Number(row?.requisites_review_count ?? 0),
    updated_at: row?.updated_at ? String(row.updated_at) : null,
    updated_at_human: row?.updated_at_human ? String(row.updated_at_human) : null,
  }));
};

const normalizeVerificationHistoryRows = (payload: unknown): VerificationHistoryRow[] => {
  const rows = Array.isArray(payload) ? payload : [];

  return rows.map((row: any) => ({
    id: String(row?.id ?? `${row?.key ?? "history"}-${row?.date ?? ""}`),
    key: String(row?.key ?? ""),
    name: String(row?.name ?? ""),
    date: String(row?.date ?? ""),
    status: normalizeVerificationStatus(row?.status),
    actor: {
      id: String(row?.actor?.id ?? ""),
      type: String(row?.actor?.type ?? ""),
      name: String(row?.actor?.name ?? ""),
    },
    data: row?.data && typeof row.data === "object" ? row.data : {},
  }));
};

const parseVerificationTabFromRoute = (value: unknown): VerificationTab => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "payout") {
    return "payout";
  }

  if (normalized === "requests") {
    return "requests";
  }

  return "client";
};

const parseVerificationSection = (value: unknown): VerificationSectionTarget | null => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "profile" || normalized === "documents" || normalized === "payout") {
    return normalized;
  }

  return null;
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

const removeUnreadVerificationNotifications = (ids: string[]): void => {
  if (ids.length === 0) {
    return;
  }

  const idSet = new Set(ids);
  unreadVerificationNotifications.value = unreadVerificationNotifications.value.filter(item => !idSet.has(item.id));
};

const hasUnreadVerificationSignal = (userId: string, section?: VerificationSectionTarget): boolean =>
  unreadVerificationNotifications.value.some(item =>
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
      .filter((item: AdminVerificationUnreadNotification | null): item is AdminVerificationUnreadNotification => Boolean(item))
      .filter(item => item.userId === props.clientId);
  } catch {
    unreadVerificationNotifications.value = [];
  }
};

const parseVerificationTabFromLocation = (): VerificationTab => {
  if (typeof window === "undefined") {
    return parseVerificationTabFromRoute(route.query.verificationTab);
  }

  const fromUrl = new URL(window.location.href).searchParams.get("verificationTab");
  return parseVerificationTabFromRoute(fromUrl);
};

const syncVerificationLocation = (tab: VerificationTab, section: VerificationSectionTarget | null = null): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (tab === "client") {
    url.searchParams.delete("verificationTab");
  } else {
    url.searchParams.set("verificationTab", tab);
  }

  if (section === null) {
    url.searchParams.delete("verificationSection");
  } else {
    url.searchParams.set("verificationSection", section);
  }

  window.history.replaceState(window.history.state, "", url.toString());
};

const ensurePayoutCommentState = (rows: AdminPaymentDetailItem[]): void => {
  const activeIds = new Set(rows.map(row => row.id));

  Object.keys(payoutCommentOpenMap).forEach(id => {
    if (!activeIds.has(id)) {
      delete payoutCommentOpenMap[id];
    }
  });

  Object.keys(payoutCommentDraftMap).forEach(id => {
    if (!activeIds.has(id)) {
      delete payoutCommentDraftMap[id];
    }
  });

  rows.forEach(row => {
    if (!(row.id in payoutCommentOpenMap)) {
      payoutCommentOpenMap[row.id] = false;
    }

    if (!payoutCommentOpenMap[row.id]) {
      payoutCommentDraftMap[row.id] = row.adminComment || "";
    }
  });
};

const isPayoutCommentOpen = (paymentDetailId: string): boolean => Boolean(payoutCommentOpenMap[paymentDetailId]);

const resolvePayoutCommentValue = (paymentDetail: AdminPaymentDetailItem): string => {
  if (isPayoutCommentOpen(paymentDetail.id)) {
    return String(payoutCommentDraftMap[paymentDetail.id] || "");
  }

  return String(paymentDetail.adminComment || "");
};

const getPayoutDocumentLoadingKey = (paymentDetailId: string, documentIndex: number): string =>
  `${paymentDetailId}:${documentIndex}`;

const isPayoutDocumentLoading = (paymentDetailId: string, documentIndex: number): boolean =>
  Boolean(payoutDocumentLoadingMap[getPayoutDocumentLoadingKey(paymentDetailId, documentIndex)]);

const isAbsoluteHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "avif"];
const textExtensions = ["txt", "text", "md", "csv", "json", "xml", "log"];

const extractFileExtension = (value: string): string => {
  const normalized = String(value || "").split("?")[0].split("#")[0].trim().toLowerCase();
  const segments = normalized.split(".");

  return segments.length > 1 ? segments.pop() || "" : "";
};

const resolvePreviewKind = (source: {
  src?: string;
  path?: string;
  mimeType?: string;
  name?: string;
}): VerificationPreviewKind => {
  const mimeType = String(source.mimeType || "").trim().toLowerCase();

  if (mimeType.startsWith("image/")) {
    return "image";
  }

  if (mimeType.includes("pdf")) {
    return "pdf";
  }

  if (mimeType.startsWith("text/") || mimeType.includes("json") || mimeType.includes("xml")) {
    return "text";
  }

  const extension = extractFileExtension(source.src || source.path || source.name || "");

  if (imageExtensions.includes(extension)) {
    return "image";
  }

  if (extension === "pdf") {
    return "pdf";
  }

  if (textExtensions.includes(extension)) {
    return "text";
  }

  return "file";
};

const resolvePreviewLabel = (kind: VerificationPreviewKind): string => {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "text":
      return "TXT";
    case "file":
      return "FILE";
    default:
      return "IMG";
  }
};

const buildPreviewMeta = (source: {
  src?: string;
  path?: string;
  mimeType?: string;
  name?: string;
}): VerificationPreviewMeta => {
  const type = resolvePreviewKind(source);

  return {
    type,
    src: type === "image" ? String(source.src || source.path || "").trim() : "",
    label: resolvePreviewLabel(type),
  };
};

const resolvePayoutDocumentPreviewSrc = (document: AdminPaymentDetailDocument): string => {
  if (document.previewUrl) {
    return document.previewUrl;
  }

  return isAbsoluteHttpUrl(document.path) ? document.path : "";
};

const documentPreviewMeta = (document: VerificationDocumentItem): VerificationPreviewMeta =>
  buildPreviewMeta({
    src: document.document_data.full_url,
    name: document.name || document.document_data.number,
  });

const paymentDetailDocumentPreviewMeta = (document: AdminPaymentDetailDocument): VerificationPreviewMeta =>
  buildPreviewMeta({
    src: resolvePayoutDocumentPreviewSrc(document),
    path: document.path,
    mimeType: document.mimeType,
    name: document.name,
  });

const loadVerificationData = async () => {
  isLoading.value = true;

  try {
    const [verificationResponse, documentsResponse, paymentsResponse] = await Promise.all([
      appCore.adminModules.verificationRequests.get(props.clientId),
      appCore.adminModules.documents.get({ clientId: props.clientId }),
      appCore.payments.get({
        page: 1,
        perPage: 1,
        orderBy: "created_at",
        orderDirection: "asc",
        ["filters[user_id]"]: props.clientId,
        ["filters[type]"]: "deposit",
      }),
    ]);

    const verificationRequestDto = Array.isArray(verificationResponse?.data?.data) ? verificationResponse.data.data[0] : null;
    const payloadData = verificationRequestDto?.data || {};

    Object.assign(verificationRequestData, initialData, payloadData);
    verificationHistoryRows.value = normalizeVerificationHistoryRows(payloadData?.history);
    verificationHistoryVisibleCount.value = Math.min(Math.max(verificationHistoryVisibleCount.value, 10), Math.max(verificationHistoryRows.value.length, 10));

    infoStatus.value = normalizeVerificationStatus(verificationRequestData?.info?.verification_status);
    infoComment.value = verificationRequestData?.info?.comment || "";
    documentsStatus.value = normalizeVerificationStatus(verificationRequestData?.documents?.verification_status);
    documentsComment.value = verificationRequestData?.documents?.comment || "";

    documentsListRequestData.value = Array.isArray(documentsResponse?.data?.data)
      ? documentsResponse.data.data.map((row: any) => ({
          id: String(row?.id ?? ""),
          name: String(row?.name ?? ""),
          state: normalizeVerificationStatus(row?.state),
          comment: String(row?.comment ?? ""),
          document_data: {
            number: String(row?.document_data?.number ?? ""),
            full_url: String(row?.document_data?.full_url ?? ""),
          },
        }))
      : [];

    const paymentRows = Array.isArray(paymentsResponse?.data?.data?.data)
      ? paymentsResponse.data.data.data
      : [];

    firstDeposit.value = paymentRows.length > 0
      ? {
          id: String(paymentRows[0]?.id ?? ""),
          type: String(paymentRows[0]?.type ?? ""),
          status: String(paymentRows[0]?.status ?? ""),
          amount: Number(paymentRows[0]?.amount ?? 0),
          currency: String(paymentRows[0]?.currency ?? "USD"),
          created_at: String(paymentRows[0]?.created_at ?? ""),
          payment_gateway: String(paymentRows[0]?.payment_gateway ?? ""),
          payment_system_name: String(paymentRows[0]?.payment_system_name ?? ""),
          legacy_payment_system_name: String(paymentRows[0]?.legacy_payment_system_name ?? ""),
        }
      : null;
  } finally {
    isLoading.value = false;
  }
};

const loadPayoutVerificationData = async () => {
  isPayoutLoading.value = true;

  try {
    const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId, {
      archived: payoutArchivedFilter.value,
    });
    const rawRows = Array.isArray(response?.data?.data) ? response.data.data : [];

    payoutDetails.value = rawRows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      status: normalizePaymentStatus(row.status),
      paymentSystemName: String(row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""),
      updatedAt: String(row.updated_at ?? ""),
      deletedAt: String(row.deleted_at ?? ""),
      isArchived: Boolean(row.is_archived ?? row.deleted_at),
      adminComment: String(row.admin_comment ?? ""),
      data: row?.data && typeof row.data === "object" ? row.data : {},
      documents: normalizePayoutDocuments(row.documents),
    }));

    ensurePayoutCommentState(payoutDetails.value);
  } finally {
    isPayoutLoading.value = false;
  }
};

const loadClientVerificationRequests = async () => {
  isRequestsLoading.value = true;

  try {
    const response = await appCore.adminModules.verificationRequests.getAll({
      page: 1,
      perPage: 50,
      userId: props.clientId,
      orderBy: "updated_at",
      orderDirection: "desc",
    });

    clientRequestRows.value = normalizeClientRequests(response?.data?.data ?? {});
  } finally {
    isRequestsLoading.value = false;
  }
};

const requestStateRank = (state: RequestReviewState): number => {
  switch (state) {
    case "pending":
      return 0;
    case "approved":
      return 1;
    case "rejected":
      return 2;
  }
};

const sortedClientRequestRows = computed(() =>
  [...clientRequestRows.value].sort((left, right) => {
    const rankDiff = requestStateRank(left.request_state) - requestStateRank(right.request_state);
    if (rankDiff !== 0) {
      return rankDiff;
    }

    return new Date(right.updated_at || 0).getTime() - new Date(left.updated_at || 0).getTime();
  })
);

const requestHasProfileToReview = (request: ClientVerificationRequestRow): boolean =>
  request.profile_review_required;

const requestHasDocumentsToReview = (request: ClientVerificationRequestRow): boolean =>
  request.documents_review_count > 0;

const requestHasPayoutToReview = (request: ClientVerificationRequestRow): boolean =>
  request.requisites_review_count > 0;

const activePendingRequest = computed(() =>
  sortedClientRequestRows.value.find(request => request.request_state === "pending") ?? null
);

const hasPendingProfile = computed(() => Boolean(activePendingRequest.value && requestHasProfileToReview(activePendingRequest.value)));
const hasPendingDocuments = computed(() => Boolean(activePendingRequest.value && requestHasDocumentsToReview(activePendingRequest.value)));
const hasPendingPayout = computed(() => Boolean(activePendingRequest.value && requestHasPayoutToReview(activePendingRequest.value)));
const hasPendingRequests = computed(() => clientRequestRows.value.some(request => request.request_state === "pending"));
const hasUnreadProfileSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "profile"));
const hasUnreadDocumentsSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "documents"));
const hasUnreadPayoutSignals = computed(() => hasUnreadVerificationSignal(props.clientId, "payout"));
const hasUnreadRequestSignals = computed(() => hasUnreadVerificationSignal(props.clientId));
const pendingDocuments = computed(() => documentsListRequestData.value.filter(document => document.state === "pending"));
const pendingPayoutDetails = computed(() =>
  payoutDetails.value.filter(paymentDetail => paymentDetail.status === "pending" && !paymentDetail.isArchived)
);
const isAnyLoading = computed(() => isLoading.value || isPayoutLoading.value || isRequestsLoading.value);
const isInitialTimelineLoading = computed(() => isAnyLoading.value && verificationHistoryRows.value.length === 0 && clientRequestRows.value.length === 0);

const timelineStatusFilterOptions = computed<Array<{
  value: VerificationTimelineStatusFilter;
  label: string;
  icon: string;
  severity: "secondary" | "warn" | "success" | "danger";
}>>(() => [
  {
    value: "all",
    label: text("admin.verifications.clientTimeline.filters.statusAll", "All"),
    icon: "pi pi-list",
    severity: "secondary",
  },
  {
    value: "pending",
    label: text("admin.verifications.status.pending", "Pending"),
    icon: "pi pi-clock",
    severity: "warn",
  },
  {
    value: "approved",
    label: text("admin.verifications.actions.approve", "Approve"),
    icon: "pi pi-check",
    severity: "success",
  },
  {
    value: "rejected",
    label: text("admin.verifications.actions.reject", "Reject"),
    icon: "pi pi-times",
    severity: "danger",
  },
]);

const setTimelineSectionFilter = (filter: VerificationTimelineSectionFilter): void => {
  activeTimelineSectionFilter.value = filter;
};

const setTimelineStatusFilter = (filter: VerificationTimelineStatusFilter): void => {
  activeTimelineStatusFilter.value = filter;
};

const requestFocusItems = (request: ClientVerificationRequestRow): Array<{
  id: VerificationSectionTarget;
  label: string;
  section: VerificationSectionTarget;
}> => {
  const items: Array<{
    id: VerificationSectionTarget;
    label: string;
    section: VerificationSectionTarget;
  }> = [];

  if (requestHasProfileToReview(request)) {
    items.push({
      id: "profile",
      label: text("admin.verifications.changes.profile", "Profile data changed"),
      section: "profile",
    });
  }

  if (requestHasDocumentsToReview(request)) {
    items.push({
      id: "documents",
      label: text("admin.verifications.changes.documents", "{count} document(s) uploaded", {
        count: request.documents_review_count,
      }),
      section: "documents",
    });
  }

  if (requestHasPayoutToReview(request)) {
    items.push({
      id: "payout",
      label: text("admin.verifications.changes.requisites", "{count} payment detail(s) changed", {
        count: request.requisites_review_count,
      }),
      section: "payout",
    });
  }

  return items;
};

const currentRequestDocumentPreviews = computed(() =>
  documentsListRequestData.value
    .map(documentPreviewMeta)
    .slice(0, 2)
);

const currentRequestPayoutPreviews = computed(() =>
  payoutDetails.value
    .flatMap(paymentDetail => paymentDetail.documents)
    .map(paymentDetailDocumentPreviewMeta)
    .slice(0, 2)
);

const requestDocumentPreviews = (request: ClientVerificationRequestRow): VerificationPreviewMeta[] =>
  requestHasDocumentsToReview(request) ? currentRequestDocumentPreviews.value : [];

const requestPayoutPreviews = (request: ClientVerificationRequestRow): VerificationPreviewMeta[] =>
  requestHasPayoutToReview(request) ? currentRequestPayoutPreviews.value : [];

const visibleVerificationHistoryRows = computed(() =>
  verificationHistoryRows.value.slice(0, verificationHistoryVisibleCount.value)
);

const hasMoreVerificationHistory = computed(() =>
  verificationHistoryRows.value.length > verificationHistoryVisibleCount.value
);

const loadMoreVerificationHistory = (): void => {
  verificationHistoryVisibleCount.value += 10;
};

const historyChangeRows = (row: VerificationHistoryRow): VerificationHistoryChange[] => {
  const changes = Array.isArray(row.data?.changes) ? row.data.changes : [];

  return changes
    .map((change: any) => ({
      field: String(change?.field ?? ""),
      old: change?.old ?? null,
      new: change?.new ?? null,
    }))
    .filter(change => change.field !== "");
};

const historyDocumentPreviews = (row: VerificationHistoryRow): Array<{
  id: string;
  label: string;
  url: string;
  preview: VerificationPreviewMeta;
}> => {
  const documentIds = Array.isArray(row.data?.document_ids)
    ? row.data.document_ids.map((id: unknown) => String(id ?? "")).filter(Boolean)
    : [];

  if (documentIds.length === 0) {
    return [];
  }

  const idSet = new Set(documentIds);

  return documentsListRequestData.value
    .filter(document => idSet.has(document.id))
    .map(document => ({
      id: document.id,
      label: document.name || document.document_data.number || document.id,
      url: document.document_data.full_url,
      preview: documentPreviewMeta(document),
    }));
};

const parseTimelineDate = (value: string | null | undefined): number => {
  const normalized = String(value ?? "").trim();
  if (normalized === "") {
    return 0;
  }

  const nativeTime = new Date(normalized).getTime();
  if (!Number.isNaN(nativeTime)) {
    return nativeTime;
  }

  const match = normalized.match(/^(\d{2})\.(\d{2})\.(\d{2,4})\s+(\d{2}):(\d{2})$/);
  if (!match) {
    return 0;
  }

  const [, day, month, rawYear, hour, minute] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;

  return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)).getTime();
};

const hiddenVerificationHistoryKeys = new Set([
  "email_verification_sent",
  "step_status_auto_synced",
  "step_status_updated",
  "step_status_reset",
  "step_comment_cleared",
]);

const visibleHistoryActorTypes = new Set(["admin", "client"]);

const shouldShowVerificationHistoryRow = (row: VerificationHistoryRow): boolean => {
  const key = row.key.trim().toLowerCase();
  const actorType = row.actor.type.trim().toLowerCase();

  if (!visibleHistoryActorTypes.has(actorType)) {
    return false;
  }

  if (hiddenVerificationHistoryKeys.has(key) || key.startsWith("step_")) {
    return false;
  }

  return true;
};

const timelineKindFromHistoryKey = (key: string): VerificationTimelineKind => {
  const normalized = String(key || "").toLowerCase();

  if (normalized.includes("document") || normalized.includes("photo")) {
    return "documents";
  }

  if (normalized.includes("payout")) {
    return "payout";
  }

  if (normalized.includes("profile") || normalized.includes("step")) {
    return "profile";
  }

  return "system";
};

const timelineSectionFromKind = (kind: VerificationTimelineKind): VerificationSectionTarget => {
  if (kind === "documents") {
    return "documents";
  }

  if (kind === "payout") {
    return "payout";
  }

  return "profile";
};

const timelineIconFromKind = (kind: VerificationTimelineKind): string => {
  switch (kind) {
    case "documents":
      return "pi pi-file";
    case "payout":
      return "pi pi-wallet";
    case "system":
      return "pi pi-history";
    default:
      return "pi pi-user";
  }
};

const historyTitle = (row: VerificationHistoryRow): string => {
  const key = `admin.verifications.historyKeys.${row.key}`;
  return text(key, row.name || text("admin.verifications.history.generic", "Verification activity"));
};

const profileSnapshotFields = (): VerificationTimelineField[] =>
  [
    "first_name",
    "last_name",
    "mid_name",
    "birthdate",
    "phone",
    "email",
    "country",
    "state",
    "city",
    "postal_code",
    "address",
  ].map(field => ({
    key: field,
    label: profileFieldLabel(field),
    value: formatHistoryValue((props.userData as Record<string, unknown>)?.[field]),
  }));

const documentTimelineDocuments = (documents: VerificationDocumentItem[]): VerificationTimelineDocument[] =>
  documents.map(document => ({
    id: document.id,
    label:
      document.name ||
      document.document_data.number ||
      text("admin.verifications.documents.defaultName", "Document"),
    url: document.document_data.full_url,
    preview: documentPreviewMeta(document),
  }));

const payoutTimelineDocuments = (paymentDetail: AdminPaymentDetailItem): VerificationTimelineDocument[] =>
  paymentDetail.documents.map((document, index) => ({
    id: `${paymentDetail.id}:${index}`,
    label:
      document.name ||
      text("admin.verifications.documents.numberedPreviewAlt", "Document #{number}", { number: index + 1 }),
    url: resolvePayoutDocumentPreviewSrc(document) || document.path,
    preview: paymentDetailDocumentPreviewMeta(document),
    paymentDetailId: paymentDetail.id,
    paymentDetailDocumentIndex: index,
  }));

const historyTimelineDocuments = (row: VerificationHistoryRow): VerificationTimelineDocument[] => {
  const documents = historyDocumentPreviews(row).map(document => ({
    id: document.id,
    label: document.label,
    url: document.url,
    preview: document.preview,
  }));

  const payoutSnapshotDocuments = Array.isArray(row.data?.payment_detail_snapshot?.documents)
    ? row.data.payment_detail_snapshot.documents
    : Array.isArray(row.data?.documents)
      ? row.data.documents
      : [];

  payoutSnapshotDocuments.forEach((rawDocument: any, index: number) => {
    if (!rawDocument || typeof rawDocument !== "object") {
      return;
    }

    const path = String(rawDocument.path ?? rawDocument.preview_url ?? rawDocument.previewUrl ?? "").trim();
    const previewUrl = String(rawDocument.preview_url ?? rawDocument.previewUrl ?? "").trim();
    if (!path && !previewUrl) {
      return;
    }

    const preview = buildPreviewMeta({
      src: previewUrl || path,
      path,
      mimeType: String(rawDocument.mime_type ?? rawDocument.mimeType ?? ""),
      name: String(rawDocument.name ?? ""),
    });

    documents.push({
      id: `${row.id}:payout-document:${index}`,
      label:
        String(rawDocument.name ?? "").trim() ||
        text("admin.verifications.documents.numberedPreviewAlt", "Document #{number}", { number: index + 1 }),
      url: previewUrl || path,
      preview,
    });
  });

  return documents;
};

const historyTimelineFields = (row: VerificationHistoryRow): VerificationTimelineField[] => {
  const snapshot = row.data?.payment_detail_snapshot;
  const source =
    snapshot?.data?.fields && typeof snapshot.data.fields === "object"
      ? snapshot.data.fields
      : row.data?.payment_detail?.data && typeof row.data.payment_detail.data === "object"
        ? row.data.payment_detail.data
        : null;

  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return [];
  }

  return Object.entries(source as Record<string, unknown>)
    .map(([key, value]) => ({
      key,
      label: paymentFieldLabel(key),
      value: formatPaymentValue(value),
    }))
    .filter(field => field.value !== "");
};

const pendingTimelineItems = computed<VerificationTimelineItem[]>(() => {
  const request = activePendingRequest.value;
  const items: VerificationTimelineItem[] = [];
  const requestId = request?.id ?? "";
  const requestDate = request?.updated_at_human || request?.updated_at || "";
  const requestSortTime = parseTimelineDate(request?.updated_at);

  if (request && requestHasProfileToReview(request)) {
    const latestProfileHistory = verificationHistoryRows.value.find(row => row.key === "profile_submitted");
    const changes = latestProfileHistory ? historyChangeRows(latestProfileHistory) : [];

    items.push({
      id: `pending-profile-${request.id}`,
      kind: "profile",
      section: "profile",
      status: "pending",
      statusText: statusText("pending"),
      icon: "pi pi-user-edit",
      title: text("admin.verifications.clientTimeline.items.profileTitle", "Profile data requires review"),
      description: text(
        "admin.verifications.clientTimeline.items.profileDescription",
        "Client changed profile data. Approve to keep it or reject to roll back logged changes."
      ),
      actor: latestProfileHistory ? historyActorText(latestProfileHistory) : text("admin.verifications.history.actorClient", "Client"),
      date: latestProfileHistory?.date || requestDate,
      sortTime: parseTimelineDate(latestProfileHistory?.date) || requestSortTime,
      requestId,
      actionable: canUpdateVerifications.value,
      actionType: "profile",
      actionId: request.id,
      changes,
      fields: changes.length ? [] : profileSnapshotFields(),
      documents: [],
      unread: hasUnreadProfileSignals.value,
    });
  }

  pendingDocuments.value.forEach(document => {
    items.push({
      id: `pending-document-${document.id}`,
      kind: "documents",
      section: "documents",
      status: document.state,
      statusText: statusText(document.state),
      icon: "pi pi-file-check",
      title:
        document.name ||
        document.document_data.number ||
        text("admin.verifications.clientTimeline.items.documentTitle", "Document requires review"),
      description: text("admin.verifications.clientTimeline.items.documentDescription", "Client uploaded a document for identity verification."),
      actor: text("admin.verifications.history.actorClient", "Client"),
      date: requestDate,
      sortTime: requestSortTime,
      requestId,
      actionable: canUpdateVerifications.value,
      actionType: "document",
      actionId: document.id,
      changes: [],
      fields: [],
      documents: documentTimelineDocuments([document]),
      unread: hasUnreadDocumentsSignals.value,
    });
  });

  pendingPayoutDetails.value.forEach(paymentDetail => {
    items.push({
      id: `pending-payout-${paymentDetail.id}`,
      kind: "payout",
      section: "payout",
      status: paymentDetail.status,
      statusText: statusText(paymentDetail.status),
      icon: "pi pi-wallet",
      title: paymentDetail.name || text("admin.verifications.clientTimeline.items.payoutTitle", "Payment detail requires review"),
      description:
        paymentDetail.paymentSystemName ||
        text("admin.verifications.clientTimeline.items.payoutDescription", "Client submitted or updated payment details."),
      actor: text("admin.verifications.history.actorClient", "Client"),
      date: paymentDetail.updatedAt || requestDate,
      sortTime: parseTimelineDate(paymentDetail.updatedAt) || requestSortTime,
      requestId,
      actionable: canUpdatePaymentDetails.value,
      actionType: "payout",
      actionId: paymentDetail.id,
      changes: [],
      fields: paymentDetailPrimaryEntries(paymentDetail),
      documents: payoutTimelineDocuments(paymentDetail),
      unread: hasUnreadPayoutSignals.value,
    });
  });

  return items;
});

const historyTimelineItems = computed<VerificationTimelineItem[]>(() =>
  verificationHistoryRows.value.filter(shouldShowVerificationHistoryRow).map(row => {
    const kind = timelineKindFromHistoryKey(row.key);
    const section = timelineSectionFromKind(kind);

    return {
      id: `history-${row.id}`,
      kind,
      section,
      status: row.status,
      statusText: statusText(row.status),
      icon: timelineIconFromKind(kind),
      title: historyTitle(row),
      description: text("admin.verifications.clientTimeline.items.historyDescription", "Recorded verification activity."),
      actor: historyActorText(row),
      date: row.date,
      sortTime: parseTimelineDate(row.date),
      requestId: "",
      actionable: false,
      actionType: null,
      actionId: row.id,
      changes: historyChangeRows(row),
      fields: historyTimelineFields(row),
      documents: historyTimelineDocuments(row),
      unread: false,
    };
  })
);

const timelineSectionMatches = (item: VerificationTimelineItem, filter: VerificationTimelineSectionFilter): boolean => {
  if (filter === "all") {
    return true;
  }

  if (filter === "history") {
    return item.id.startsWith("history-");
  }

  return item.kind === filter;
};

const timelineStatusMatches = (item: VerificationTimelineItem, filter: VerificationTimelineStatusFilter): boolean =>
  filter === "all" || item.status === filter;

const rawVerificationTimelineItems = computed(() =>
  [
    ...pendingTimelineItems.value,
    ...historyTimelineItems.value.slice(0, verificationHistoryVisibleCount.value),
  ].sort((left, right) => right.sortTime - left.sortTime)
);

const verificationSummaryCards = computed(() => {
  const rawItems = rawVerificationTimelineItems.value;
  const countBySection = (filter: VerificationTimelineSectionFilter): number =>
    rawItems.filter(item => timelineSectionMatches(item, filter)).length;

  return [
    {
      id: "all",
      filter: "all" as const,
      kind: hasPendingRequests.value ? "warning" : "info",
      label: text("admin.verifications.clientTimeline.filters.all", "All"),
      value: String(rawItems.length),
      hint: text("admin.verifications.clientTimeline.filters.allHint", "All visible review records"),
    },
    {
      id: "pending_profile",
      filter: "profile" as const,
      kind: hasPendingProfile.value ? "warning" : "success",
      label: text("admin.verifications.clientTimeline.summary.profile", "Profile changes"),
      value: String(countBySection("profile")),
      hint: hasPendingProfile.value
        ? text("admin.verifications.clientTimeline.summary.pending", "Waiting for review")
        : text("admin.verifications.clientTimeline.summary.clear", "No pending changes"),
    },
    {
      id: "pending_documents",
      filter: "documents" as const,
      kind: pendingDocuments.value.length > 0 ? "warning" : "success",
      label: text("admin.verifications.clientTimeline.summary.documents", "Documents"),
      value: String(countBySection("documents")),
      hint: text("admin.verifications.clientTimeline.summary.pendingDocuments", "Documents waiting for moderation"),
    },
    {
      id: "pending_payout",
      filter: "payout" as const,
      kind: pendingPayoutDetails.value.length > 0 ? "warning" : "success",
      label: text("admin.verifications.clientTimeline.summary.paymentDetails", "Payment details"),
      value: String(countBySection("payout")),
      hint: text("admin.verifications.clientTimeline.summary.pendingPaymentDetails", "Payment details waiting for moderation"),
    },
    {
      id: "history",
      filter: "history" as const,
      kind: "info",
      label: text("admin.verifications.clientTimeline.summary.history", "History records"),
      value: String(historyTimelineItems.value.length),
      hint: text("admin.verifications.clientTimeline.summary.historyHint", "Newest records are shown first"),
    },
  ];
});

const visibleVerificationTimelineItems = computed(() =>
  rawVerificationTimelineItems.value.filter(item =>
    timelineSectionMatches(item, activeTimelineSectionFilter.value)
    && timelineStatusMatches(item, activeTimelineStatusFilter.value)
  )
);

const hasMoreVerificationTimeline = computed(() =>
  historyTimelineItems.value.length > verificationHistoryVisibleCount.value
);

const profileFieldLabel = (field: string): string => {
  const key = `admin.verifications.profileFields.${field}`;
  return text(key, normalizePaymentLabel(field));
};

const formatHistoryValue = (value: unknown): string => {
  const normalized = String(value ?? "").trim();
  return normalized !== "" ? normalized : "-";
};

const historyActorText = (row: VerificationHistoryRow): string => {
  const actorName = row.actor.name.trim();
  if (actorName) {
    return actorName;
  }

  if (row.actor.type === "admin") {
    return text("admin.verifications.history.actorAdmin", "Admin");
  }

  if (row.actor.type === "client") {
    return text("admin.verifications.history.actorClient", "Client");
  }

  return text("admin.verifications.history.actorSystem", "System");
};

const verificationTabs = computed(() => [
  {
    id: "client" as const,
    label: text("admin.verifications.tabs.client", "General verification"),
    needsAttention: hasPendingProfile.value || hasPendingDocuments.value || hasUnreadProfileSignals.value || hasUnreadDocumentsSignals.value,
  },
  {
    id: "payout" as const,
    label: text("admin.verifications.tabs.payout", "Payment details"),
    needsAttention: hasPendingPayout.value || hasUnreadPayoutSignals.value,
  },
  {
    id: "requests" as const,
    label: text("admin.verifications.tabs.requests", "Requests"),
    needsAttention: hasPendingRequests.value || hasUnreadRequestSignals.value,
  },
]);

const markTabSeen = (tab: VerificationTab): void => {
  if (typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      seenTabs[tab] = true;
    });

    return;
  }

  seenTabs[tab] = true;
};

const resolveSectionElement = (section: VerificationSectionTarget): HTMLElement | null => {
  switch (section) {
    case "profile":
      return profileSectionRef.value;
    case "documents":
      return documentsSectionRef.value;
    case "payout":
      return payoutSectionRef.value;
  }
};

const isVerificationSectionStillPending = (section: VerificationSectionTarget): boolean => {
  const request = activePendingRequest.value;

  if (!request) {
    return false;
  }

  switch (section) {
    case "profile":
      return requestHasProfileToReview(request);
    case "documents":
      return requestHasDocumentsToReview(request);
    case "payout":
      return requestHasPayoutToReview(request);
  }
};

const clearResolvedHighlight = (): void => {
  const section = highlightedSection.value;

  if (section !== null && !isVerificationSectionStillPending(section)) {
    highlightedSection.value = null;
  }
};

const focusVerificationSection = (section: VerificationSectionTarget): void => {
  if (clientRequestRows.value.length > 0 && !isVerificationSectionStillPending(section)) {
    highlightedSection.value = null;
    return;
  }

  highlightedSection.value = section;
  resolveSectionElement(section)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
};

const markRelevantVerificationNotificationsSeen = async (section: VerificationSectionTarget): Promise<void> => {
  const targetIds = unreadVerificationNotifications.value
    .filter(item => item.userId === props.clientId && item.section === section)
    .map(item => item.id);

  if (targetIds.length === 0) {
    return;
  }

  let latestSummary: Record<string, unknown> | null = null;

  for (const notificationId of targetIds) {
    try {
      const response = await appCore.adminModules.notifications.markRead(notificationId);
      latestSummary = response?.data?.data ?? latestSummary;
    } catch {
      // no-op
    }
  }

  removeUnreadVerificationNotifications(targetIds);

  if (latestSummary) {
    adminNotificationsStore.applySummary(latestSummary);
  }

  useEventBus.emit(ADMIN_NOTIFICATIONS_MARKED_EVENT, {
    ids: targetIds,
    summary: latestSummary ?? undefined,
  });
};

const navigateToVerificationSection = async (section: VerificationSectionTarget): Promise<void> => {
  const targetTab: VerificationTab = section === "payout" ? "payout" : "client";

  if (activeVerificationTab.value !== targetTab) {
    activeVerificationTab.value = targetTab;
  }

  syncVerificationLocation(targetTab, section);

  await nextTick();
  markTabSeen(targetTab);
  focusVerificationSection(section);
  await markRelevantVerificationNotificationsSeen(section);
};

const setVerificationTab = (tab: VerificationTab) => {
  if (activeVerificationTab.value === tab) {
    return;
  }

  activeVerificationTab.value = tab;
  syncVerificationLocation(tab, null);

  void nextTick(() => {
    markTabSeen(tab);
    if (tab === "payout") {
      void markRelevantVerificationNotificationsSeen("payout");
    }
  });
};

const handleRefreshActiveTab = async () => {
  if (activeVerificationTab.value === "payout") {
    await loadPayoutVerificationData();
    return;
  }

  if (activeVerificationTab.value === "requests") {
    await loadClientVerificationRequests();
    return;
  }

  await loadVerificationData();
};

const handleRefreshAll = async (): Promise<void> => {
  await Promise.all([
    loadVerificationData(),
    loadPayoutVerificationData(),
    loadClientVerificationRequests(),
    loadUnreadVerificationNotifications(),
  ]);
};

const getTimelineUpdateKey = (item: VerificationTimelineItem): string => `${item.actionType || "history"}:${item.actionId}`;

const isTimelineItemUpdating = (item: VerificationTimelineItem): boolean =>
  Boolean(timelineUpdatingState[getTimelineUpdateKey(item)]);

const finalizeRequestAfterTimelineAction = async (
  requestId: string,
  preferredState: Exclude<RequestReviewState, "pending">
): Promise<void> => {
  const normalizedRequestId = String(requestId || "").trim();
  if (normalizedRequestId === "" || pendingTimelineItems.value.length > 0) {
    return;
  }

  requestUpdatingState[normalizedRequestId] = true;

  try {
    await appCore.adminModules.verificationRequests.put(normalizedRequestId, {
      type: "request",
      updatedStatus: { status: preferredState, comment: "" },
    });

    await Promise.all([loadVerificationData(), loadPayoutVerificationData(), loadClientVerificationRequests()]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || text("admin.verifications.errors.update", "Failed to update request status."));
  } finally {
    delete requestUpdatingState[normalizedRequestId];
  }
};

const handleTimelineItemAction = async (item: VerificationTimelineItem, status: Exclude<VerificationStatus, "pending">): Promise<void> => {
  if (!item.actionable || item.actionType === null) {
    return;
  }

  const updateKey = getTimelineUpdateKey(item);
  timelineUpdatingState[updateKey] = true;

  try {
    if (item.actionType === "profile") {
      await handleVerificationProfile({ status, comment: "" });
    } else if (item.actionType === "document") {
      await handleVerificationDocument({ status, comment: "" }, item.actionId);
    } else if (item.actionType === "payout") {
      await handleVerificationPayoutDetail({ status, comment: "" }, item.actionId);
    }

    await nextTick();
    await finalizeRequestAfterTimelineAction(item.requestId, status);
  } finally {
    delete timelineUpdatingState[updateKey];
  }
};

const handleTimelineDecisionClick = (
  item: VerificationTimelineItem,
  status: Exclude<VerificationStatus, "pending">
): void => {
  void handleTimelineItemAction(item, status);
};

const openTimelineDocument = async (document: VerificationTimelineDocument): Promise<void> => {
  if (document.paymentDetailId && typeof document.paymentDetailDocumentIndex === "number") {
    await handleOpenPayoutDocument(document.paymentDetailId, document.paymentDetailDocumentIndex);
    return;
  }

  if (document.url) {
    window.open(document.url, "_blank", "noopener,noreferrer");
  }
};

const toggleInfoComment = () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isInfoCommentOpen.value = !isInfoCommentOpen.value;
  if (isInfoCommentOpen.value) {
    infoCommentDraft.value = infoComment.value || "";
  }
};

const handleInfoCommentInput = (e: any) => {
  infoCommentDraft.value = e.target.value;
};

const submitInfoComment = async () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isInfoCommentOpen.value = false;
  await handleVerificationProfile({ status: infoStatus.value, comment: infoCommentDraft.value || "" });
};

const cancelInfoComment = () => {
  isInfoCommentOpen.value = false;
  infoCommentDraft.value = infoComment.value || "";
};

const toggleDocumentsComment = () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isDocumentsCommentOpen.value = !isDocumentsCommentOpen.value;
  if (isDocumentsCommentOpen.value) {
    documentsCommentDraft.value = documentsComment.value || "";
  }
};

const handleDocumentsCommentInput = (e: any) => {
  documentsCommentDraft.value = e.target.value;
};

const submitDocumentsComment = async () => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isDocumentsCommentOpen.value = false;
  await handleVerificationDocuments({ status: documentsStatus.value, comment: documentsCommentDraft.value || "" });
};

const cancelDocumentsComment = () => {
  isDocumentsCommentOpen.value = false;
  documentsCommentDraft.value = documentsComment.value || "";
};

const handleVerificationDocuments = async (value: any) => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "documents",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.documentsUpdated", "Documents status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const handleVerificationDocument = async (value: any, docId: string = "") => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      docId,
      type: "document",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.documentUpdated", "Document status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const handleVerificationProfile = async (value: any) => {
  if (!canUpdateVerifications.value) {
    return;
  }

  isLoading.value = true;

  try {
    await appCore.adminModules.verificationRequests.put(props.clientId, {
      type: "info",
      updatedStatus: { status: value.status, comment: value.comment },
    });
    toast.success(text("admin.verifications.messages.profileUpdated", "Profile status updated."));
    await loadVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isLoading.value = false;
  }
};

const togglePayoutComment = (paymentDetail: AdminPaymentDetailItem): void => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  const paymentDetailId = paymentDetail.id;
  const nextState = !isPayoutCommentOpen(paymentDetailId);

  payoutCommentOpenMap[paymentDetailId] = nextState;
  payoutCommentDraftMap[paymentDetailId] = nextState
    ? String(payoutCommentDraftMap[paymentDetailId] ?? paymentDetail.adminComment ?? "")
    : String(paymentDetail.adminComment || "");
};

const handlePayoutCommentInput = (paymentDetailId: string, event: any): void => {
  payoutCommentDraftMap[paymentDetailId] = String(event?.target?.value ?? "");
};

const cancelPayoutComment = (paymentDetailId: string): void => {
  const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);

  payoutCommentOpenMap[paymentDetailId] = false;
  payoutCommentDraftMap[paymentDetailId] = String(paymentDetail?.adminComment || "");
};

const handleVerificationPayoutDetail = async (value: any, paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  isPayoutLoading.value = true;

  try {
    const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
    const nextStatus = normalizePaymentStatus(value?.status ?? paymentDetail?.status);
    const nextComment = String(
      value?.comment ?? payoutCommentDraftMap[paymentDetailId] ?? paymentDetail?.adminComment ?? ""
    );

    await appCore.adminModules.clients.patchPaymentDetailStatus(props.clientId, paymentDetailId, {
      status: nextStatus,
      comment: nextComment,
    });
    toast.success(text("admin.verifications.messages.payoutUpdated", "Payment details status updated."));
    payoutCommentOpenMap[paymentDetailId] = false;
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const setPayoutArchivedFilter = async (value: "active" | "archived" | "all") => {
  if (payoutArchivedFilter.value === value) {
    return;
  }

  payoutArchivedFilter.value = value;
  await loadPayoutVerificationData();
};

const handleArchivePayoutDetail = async (paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  isPayoutLoading.value = true;

  try {
    await appCore.adminModules.clients.deletePaymentDetail(props.clientId, paymentDetailId);
    toast.success(text("admin.verifications.messages.payoutArchived", "Payment detail archived."));
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const handleRestorePayoutDetail = async (paymentDetailId: string) => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  isPayoutLoading.value = true;

  try {
    await appCore.adminModules.clients.restorePaymentDetail(props.clientId, paymentDetailId);
    toast.success(text("admin.verifications.messages.payoutRestored", "Payment detail restored."));
    await loadPayoutVerificationData();
    await loadClientVerificationRequests();
  } finally {
    isPayoutLoading.value = false;
  }
};

const submitPayoutComment = async (paymentDetailId: string): Promise<void> => {
  if (!canUpdatePaymentDetails.value) {
    return;
  }

  const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
  if (!paymentDetail) {
    return;
  }

  await handleVerificationPayoutDetail(
    {
      status: paymentDetail.status,
      comment: String(payoutCommentDraftMap[paymentDetailId] ?? ""),
    },
    paymentDetailId
  );
};

const handleOpenPayoutDocument = async (paymentDetailId: string, documentIndex: number) => {
  const paymentDetail = payoutDetails.value.find(item => item.id === paymentDetailId);
  const document = paymentDetail?.documents[documentIndex];
  if (!document?.path) {
    toast.error(text("admin.verifications.errors.documentNotFound", "Document not found."));
    return;
  }

  if (document.previewUrl) {
    window.open(document.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (isAbsoluteHttpUrl(document.path)) {
    window.open(document.path, "_blank", "noopener,noreferrer");
    return;
  }

  const loadingKey = getPayoutDocumentLoadingKey(paymentDetailId, documentIndex);
  payoutDocumentLoadingMap[loadingKey] = true;

  try {
    const response = await appCore.s3.getTempViewUrl({ path: document.path });
    const signedUrl = response?.data?.url || response?.data?.data?.url || "";
    const targetUrl = signedUrl || document.path;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  } catch {
    toast.error(text("admin.verifications.errors.openDocument", "Failed to open document."));
  } finally {
    delete payoutDocumentLoadingMap[loadingKey];
  }
};

const handleRequestReviewUpdate = async (
  requestId: string,
  nextState: Exclude<RequestReviewState, "pending">
): Promise<void> => {
  requestUpdatingState[requestId] = true;

  try {
    await appCore.adminModules.verificationRequests.put(requestId, {
      type: "request",
      updatedStatus: { status: nextState, comment: "" },
    });

    toast.success(text("admin.verifications.messages.updated", "Request status updated."));
    await Promise.all([loadVerificationData(), loadPayoutVerificationData(), loadClientVerificationRequests()]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || text("admin.verifications.errors.update", "Failed to update request status."));
  } finally {
    delete requestUpdatingState[requestId];
  }
};

const isRequestUpdating = (requestId: string): boolean => Boolean(requestUpdatingState[requestId]);

const paymentDetailPrimaryEntries = (paymentDetail: AdminPaymentDetailItem): Array<{ key: string; label: string; value: string }> => {
  const fieldsPayload = paymentDetail.data?.fields;
  const source = fieldsPayload && typeof fieldsPayload === "object" && !Array.isArray(fieldsPayload)
    ? fieldsPayload as Record<string, unknown>
    : Object.fromEntries(
        Object.entries(paymentDetail.data || {}).filter(([key]) => !["fields", "legacy"].includes(key))
      );

  return Object.entries(source)
    .map(([key, rawValue]) => ({
      key,
      label: paymentFieldLabel(key),
      value: formatPaymentValue(rawValue),
    }))
    .filter(entry => entry.value !== "");
};

const paymentDetailLegacyEntries = (paymentDetail: AdminPaymentDetailItem): Array<{ key: string; label: string; value: string }> => {
  const legacy = paymentDetail.data?.legacy;
  if (!legacy || typeof legacy !== "object" || Array.isArray(legacy)) {
    return [];
  }

  const legacyPayload = legacy as Record<string, unknown>;
  const rows: Array<{ key: string; label: string; value: string }> = [];
  const paysystem = legacyPayload.paysystem && typeof legacyPayload.paysystem === "object" && !Array.isArray(legacyPayload.paysystem)
    ? legacyPayload.paysystem as Record<string, unknown>
    : null;

  const systemName = formatPaymentValue(paysystem?.name);
  if (systemName) {
    rows.push({ key: "paysystem", label: text("admin.verifications.payout.legacyFields.system", "System"), value: systemName });
  }

  const legacyType = formatPaymentValue(legacyPayload.type);
  if (legacyType) {
    rows.push({ key: "type", label: text("admin.verifications.payout.legacyFields.type", "Type"), value: legacyType });
  }

  const legacyStatus = formatPaymentValue(legacyPayload.status);
  if (legacyStatus) {
    rows.push({ key: "status", label: text("admin.verifications.payout.legacyFields.status", "Legacy status"), value: legacyStatus });
  }

  const legacyId = formatPaymentValue(legacyPayload.old_requisite_id);
  if (legacyId) {
    rows.push({ key: "old_requisite_id", label: text("admin.verifications.payout.legacyFields.id", "Legacy ID"), value: legacyId });
  }

  const legacyComment = formatPaymentValue(legacyPayload.comment);
  if (legacyComment) {
    rows.push({ key: "comment", label: text("admin.verifications.payout.legacyFields.comment", "Legacy comment"), value: legacyComment });
  }

  return rows;
};

const normalizePaymentLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();

const paymentFieldLabel = (value: string): string =>
  text(`admin.verifications.payout.fields.${value}`, normalizePaymentLabel(value));

const formatPaymentValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(item => formatPaymentValue(item)).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(item => formatPaymentValue(item))
      .filter(Boolean)
      .join(", ");
  }

  return String(value ?? "").trim();
};

const shortId = (value: string): string => String(value || "").replace(/-/g, "").slice(0, 10).toUpperCase();

const formatMoney = (amount: number | string, currency: string): string => {
  const numeric = Number(amount ?? 0);
  const normalizedCurrency = String(currency || "USD").trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${normalizedCurrency}`;
  }
};

const paymentMethodName = (payment: PaymentRow | null): string => {
  if (!payment) {
    return "-";
  }

  return (
    String(payment.legacy_payment_system_name || "").trim()
    || String(payment.payment_system_name || "").trim()
    || String(payment.payment_gateway || "").trim()
    || text("admin.verifications.firstDeposit.methodFallback", "Deposit")
  );
};

const paymentStatusText = (status: string): string => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "success" || normalized === "completed") {
    return text("admin.verifications.status.approved", "Approved");
  }
  if (normalized === "rejected" || normalized === "failed" || normalized === "cancelled") {
    return text("admin.verifications.status.rejected", "Rejected");
  }

  return text("admin.verifications.status.pending", "Pending");
};

const requestStateText = (state: RequestReviewState): string => {
  switch (state) {
    case "approved":
      return text("admin.verifications.requestState.approved", "Confirmed");
    case "rejected":
      return text("admin.verifications.requestState.rejected", "Cancelled");
    default:
      return text("admin.verifications.requestState.pending", "Unprocessed");
  }
};

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

const requestStateClass = (state: RequestReviewState): string => `is-${state}`;

const handleClientDocumentImage = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const handleAdminNotificationReceived = (payload?: { notification?: any }): void => {
  const notification = normalizeUnreadVerificationNotification(payload?.notification ?? null);
  if (!notification || notification.userId !== props.clientId) {
    return;
  }

  upsertUnreadVerificationNotification(notification);

  if (notification.section === "payout") {
    void Promise.all([loadPayoutVerificationData(), loadClientVerificationRequests()]).then(async () => {
      if (activeVerificationTab.value === "payout") {
        await nextTick();
        await markRelevantVerificationNotificationsSeen("payout");
      }
    });

    return;
  }

  void Promise.all([loadVerificationData(), loadClientVerificationRequests()]).then(async () => {
    if (activeVerificationTab.value === "client") {
      await nextTick();
      await markRelevantVerificationNotificationsSeen(notification.section);
    }
  });
};

const handleMarkedNotifications = (payload?: { ids?: string[] }): void => {
  const ids = Array.isArray(payload?.ids)
    ? payload.ids.map(item => String(item ?? "").trim()).filter(Boolean)
    : [];

  removeUnreadVerificationNotifications(ids);
};

watch(infoComment, nextValue => {
  if (!isInfoCommentOpen.value) {
    infoCommentDraft.value = nextValue || "";
  }
});

watch(documentsComment, nextValue => {
  if (!isDocumentsCommentOpen.value) {
    documentsCommentDraft.value = nextValue || "";
  }
});

watch(
  () => route.query.verificationTab,
  nextValue => {
    const nextTab = parseVerificationTabFromRoute(nextValue);
    if (nextTab !== activeVerificationTab.value) {
      activeVerificationTab.value = nextTab;
      void nextTick(() => {
        markTabSeen(nextTab);
      });
    }
  }
);

watch(
  () => route.query.verificationSection,
  nextValue => {
    const nextSection = parseVerificationSection(nextValue);
    if (!nextSection) {
      return;
    }

    void nextTick(async () => {
      focusVerificationSection(nextSection);
      await markRelevantVerificationNotificationsSeen(nextSection);
    });
  }
);

watch(
  () => [
    hasPendingProfile.value,
    hasPendingDocuments.value,
    hasPendingPayout.value,
  ],
  clearResolvedHighlight
);

onMounted(async () => {
  activeVerificationTab.value = parseVerificationTabFromLocation();

  useEventBus.on(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  useEventBus.on(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);

  await Promise.all([
    loadVerificationData(),
    loadPayoutVerificationData(),
    loadClientVerificationRequests(),
    loadUnreadVerificationNotifications(),
  ]);

  await nextTick();
  markTabSeen(activeVerificationTab.value);

  const initialSection = parseVerificationSection(route.query.verificationSection);
  if (initialSection) {
    focusVerificationSection(initialSection);
    await markRelevantVerificationNotificationsSeen(initialSection);
  } else if (activeVerificationTab.value === "payout") {
    await markRelevantVerificationNotificationsSeen("payout");
  }
});

onBeforeUnmount(() => {
  useEventBus.off(ADMIN_NOTIFICATION_RECEIVED_EVENT, handleAdminNotificationReceived);
  useEventBus.off(ADMIN_NOTIFICATIONS_MARKED_EVENT, handleMarkedNotifications);
});
</script>

<style lang="scss" scoped>
.verification-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.verification-tabs__btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ui-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  transition:
    background-color 0.24s ease,
    border-color 0.24s ease,
    color 0.24s ease,
    box-shadow 0.24s ease;
}

.verification-tabs__btn:hover {
  color: var(--ui-text-main);
  border-color: rgba(73, 108, 222, 0.26);
}

.verification-tabs__btn--active {
  color: var(--ui-text-main);
  border-color: rgba(73, 108, 222, 0.42);
  background: rgba(73, 108, 222, 0.14);
}

.verification-tabs__btn--attention {
  border-color: rgba(233, 174, 0, 0.28);
  box-shadow: 0 0 0 1px rgba(233, 174, 0, 0.12);
}

.verification-tabs__indicator {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #f1c24d;
  transition: opacity 0.32s ease;
}

.verification-pane {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.verification-requests-pane {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-requests-pane__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
}

.verification-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.28s ease, box-shadow 0.28s ease;
}

.verification-card--highlighted {
  border-color: rgba(73, 108, 222, 0.46);
  box-shadow: 0 0 0 1px rgba(73, 108, 222, 0.16), 0 18px 44px rgba(6, 18, 63, 0.18);
}

.verification-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-card__title-group {
  display: inline-flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}

.verification-card__title-group svg {
  width: 15px;
  height: 15px;
  margin-top: 4px;
}

.verification-card__title {
  color: var(--ui-text-main);
}

.verification-card__subtitle {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-card__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.verification-card__refresh {
  flex-shrink: 0;
}

.verification-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.verification-grid--compact {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.verification-grid__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-grid__item--wide {
  grid-column: span 2;
}

.verification-grid__label {
  font-size: 0.74rem;
  color: var(--ui-text-secondary);
}

.verification-grid__value {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ui-text-main);
  word-break: break-word;
}

.verification-comment-box {
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.verification-comment-box__textarea {
  min-height: 96px;
}

.verification-comment-box__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
}

.verification-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  color: var(--ui-text-secondary);
  font-size: 0.86rem;
}

.verification-documents-grid,
.verification-payout-list,
.verification-client-request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-document-card,
.verification-client-request-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition:
    border-color 0.28s ease,
    box-shadow 0.28s ease,
    background-color 0.28s ease;
}

.verification-payout-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-document-card__preview {
  width: 76px;
  height: 76px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-text-secondary);
  font-size: 0.68rem;
}

.verification-document-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-document-card__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.verification-document-card__title,
.verification-payout-card__title,
.verification-client-request-card__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-document-card__subtitle,
.verification-payout-card__subtitle,
.verification-client-request-card__meta {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-payout-card__header,
.verification-client-request-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-payout-card__title-group,
.verification-client-request-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.verification-payout-card__body {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(220px, 0.95fr);
  gap: 12px;
  align-items: start;
}

.verification-payout-card__main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.verification-payout-card__field,
.verification-payout-card__legacy {
  min-height: 78px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-payout-card__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.verification-payout-card__field-label,
.verification-payout-card__legacy-label,
.verification-payout-card__documents-label {
  font-size: 0.72rem;
  color: var(--ui-text-secondary);
}

.verification-payout-card__field-value,
.verification-payout-card__legacy-value {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--ui-text-main);
  word-break: break-word;
}

.verification-payout-card__legacy {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-payout-card__legacy-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-payout-card__legacy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.verification-payout-card__legacy-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.verification-payout-card__documents,
.verification-client-request-card__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.verification-payout-card__documents {
  align-items: center;
}

.verification-payout-card__document,
.verification-preview-chip {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--ui-text-secondary);
  font-size: 0.64rem;
}

.verification-document-card__preview.is-pdf,
.verification-payout-card__document.is-pdf,
.verification-preview-chip.is-pdf {
  border-color: rgba(220, 38, 38, 0.18);
}

.verification-document-card__preview.is-text,
.verification-payout-card__document.is-text,
.verification-preview-chip.is-text {
  border-color: rgba(73, 108, 222, 0.2);
}

.verification-file-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100%;
  min-height: 100%;
  padding: 0 6px;
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--ui-text-main);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
}

.verification-file-badge.is-pdf {
  color: #ff8b8b;
}

.verification-file-badge.is-text {
  color: #8db5ff;
}

.verification-file-badge.is-file {
  color: var(--ui-text-secondary);
}

.verification-payout-card__document img,
.verification-preview-chip img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-inline-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-main);
}

.verification-inline-badge.is-approved {
  background: rgba(22, 163, 74, 0.16);
  border-color: rgba(22, 163, 74, 0.28);
}

.verification-inline-badge.is-pending {
  background: rgba(233, 174, 0, 0.14);
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-inline-badge.is-rejected {
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(220, 38, 38, 0.28);
}

.verification-focus-chip {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: rgba(233, 174, 0, 0.14);
  border: 1px solid rgba(233, 174, 0, 0.22);
  color: #f1c24d;
  font-size: 0.75rem;
  font-weight: 600;
}

.verification-focus-link {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(233, 174, 0, 0.12);
  border: 1px solid rgba(233, 174, 0, 0.24);
  color: #f1c24d;
  font-size: 0.75rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.verification-focus-link:hover {
  transform: translateY(-1px);
  background: rgba(233, 174, 0, 0.18);
  border-color: rgba(233, 174, 0, 0.34);
}

.verification-focus-link.is-unread {
  background: rgba(87, 132, 255, 0.14);
  border-color: rgba(87, 132, 255, 0.32);
  color: #b7cbff;
}

.verification-client-request-card__title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.verification-client-request-card__focus {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.verification-client-request-card__focus-muted {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
}

.verification-client-request-history {
  display: grid;
  gap: 10px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-stroke-ui-light);
}

.verification-client-request-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.verification-client-request-history__header > div,
.verification-client-request-history__row-main > div {
  display: grid;
  gap: 2px;
}

.verification-client-request-history__header strong,
.verification-client-request-history__row-main strong {
  color: var(--ui-text-main);
  font-size: 0.82rem;
}

.verification-client-request-history__header span,
.verification-client-request-history__row-main span {
  color: var(--ui-text-secondary);
  font-size: 0.72rem;
}

.verification-client-request-history__empty {
  color: var(--ui-text-secondary);
  font-size: 0.78rem;
}

.verification-client-request-history__list {
  display: grid;
  gap: 8px;
}

.verification-client-request-history__row {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 72%, transparent);
}

.verification-client-request-history__row-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.verification-client-request-history__changes {
  display: grid;
  gap: 6px;
}

.verification-client-request-history__change {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--ui-text-secondary);
  font-size: 0.76rem;
}

.verification-client-request-history__change strong {
  color: var(--ui-text-main);
  text-align: right;
}

.verification-client-request-history__documents {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.verification-client-request-history__document {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  background: color-mix(in srgb, var(--ui-background-panel) 78%, transparent);
}

.verification-client-request-history__document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-client-request-history__load {
  justify-self: center;
  color: var(--ui-primary-main);
  font-size: 0.76rem;
  font-weight: 800;
}

.verification-client-request-history__load:hover {
  text-decoration: underline;
}

.verification-client-request-card.is-pending-row {
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-client-request-card.is-unread-notification {
  border-color: rgba(87, 132, 255, 0.38);
  box-shadow: 0 0 0 1px rgba(87, 132, 255, 0.16), 0 10px 28px rgba(16, 38, 120, 0.12);
}

.comment-expand-enter-active,
.comment-expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.comment-expand-enter-from,
.comment-expand-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1100px) {
  .verification-grid,
  .verification-grid--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .verification-card__header,
  .verification-client-request-card,
  .verification-document-card {
    grid-template-columns: 1fr;
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .verification-card__actions,
  .verification-client-request-card > :deep(.request-review-actions) {
    align-self: flex-start;
  }

  .verification-payout-card__header,
  .verification-payout-card__body {
    display: flex;
    flex-direction: column;
  }
}

@media (max-width: 680px) {
  .verification-grid,
  .verification-grid--compact {
    grid-template-columns: 1fr;
  }

  .verification-grid__item--wide {
    grid-column: span 1;
  }

  .verification-payout-card__main {
    grid-template-columns: 1fr;
  }
}

.client-verification {
  --verification-glass-bg: color-mix(in srgb, var(--ui-background-card) 74%, transparent);
  --verification-glass-bg-strong: color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
  --verification-glass-border: color-mix(in srgb, var(--ui-primary-main) 16%, var(--color-stroke-ui-light));
  --verification-glass-shadow: 0 18px 56px color-mix(in srgb, #000000 20%, transparent);

  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  color: var(--ui-text-main);
}

.client-verification__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.client-verification__header h2 {
  margin: 0;
  color: var(--ui-text-main);
  font-size: clamp(22px, 1.8vw, 30px);
  font-weight: 850;
  line-height: 1.06;
  letter-spacing: -0.035em;
}

.client-verification__header p {
  max-width: 820px;
  margin: 6px 0 0;
  color: var(--ui-text-secondary);
  font-size: 13px;
  line-height: 1.45;
}

.client-verification__header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 9px;
  flex-wrap: wrap;
}

.client-verification__summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.verification-summary-card,
.verification-timeline-card,
.verification-empty-card {
  --verification-accent: var(--ui-primary-main);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  height: auto;
  border: 1px solid var(--verification-glass-border);
  border-radius: 22px;
  background:
    radial-gradient(circle at 16% 0%, color-mix(in srgb, var(--verification-accent) 10%, transparent), transparent 38%),
    linear-gradient(145deg, var(--verification-glass-bg), var(--verification-glass-bg-strong));
  box-shadow: var(--verification-glass-shadow);
  backdrop-filter: blur(22px) saturate(135%);
  -webkit-backdrop-filter: blur(22px) saturate(135%);
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    box-shadow 0.18s ease;
}

.verification-summary-card :deep(.p-card-body),
.verification-summary-card :deep(.p-card-content),
.verification-timeline-card :deep(.p-card-body),
.verification-timeline-card :deep(.p-card-content),
.verification-empty-card :deep(.p-card-body),
.verification-empty-card :deep(.p-card-content) {
  padding: 0;
}

.verification-summary-card::after,
.verification-timeline-card::after,
.verification-empty-card::after {
  content: "";
  position: absolute;
  inset: -44% auto -44% -58%;
  z-index: 0;
  width: 30%;
  pointer-events: none;
  background: linear-gradient(110deg, transparent, color-mix(in srgb, #ffffff 4%, transparent), transparent);
  filter: blur(16px);
  opacity: 0;
  transform: rotate(10deg) translateX(-40%);
}

.verification-summary-card:hover,
.verification-timeline-card:hover {
  transform: translateY(-0.5px);
  border-color: color-mix(in srgb, var(--verification-accent) 24%, var(--color-stroke-ui-light));
  box-shadow: 0 18px 52px color-mix(in srgb, var(--verification-accent) 7%, #000000 17%);
}

.verification-summary-card:hover::after,
.verification-timeline-card:hover::after {
  animation: verification-glass-glint 1.65s ease both;
}

.verification-summary-card {
  cursor: pointer;
}

.verification-summary-card.is-active {
  border-color: color-mix(in srgb, var(--verification-accent) 54%, var(--color-stroke-ui-light));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--verification-accent) 14%, transparent),
    0 18px 54px color-mix(in srgb, var(--verification-accent) 8%, #000000 16%);
}

.verification-summary-card--warning,
.verification-timeline-card--documents {
  --verification-accent: var(--color-warning);
}

.verification-summary-card--success,
.verification-timeline-card--profile {
  --verification-accent: var(--color-success);
}

.verification-summary-card--info,
.verification-timeline-card--payout {
  --verification-accent: var(--color-info);
}

.verification-timeline-card--system {
  --verification-accent: var(--ui-primary-main);
}

.verification-summary-card__body {
  min-height: 104px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 9px;
  padding: 12px;
}

.verification-summary-card__label,
.verification-summary-card__hint {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 720;
  line-height: 1.35;
}

.verification-summary-card__label {
  font-weight: 780;
  letter-spacing: 0.015em;
}

.verification-summary-card__value {
  color: var(--ui-text-main);
  font-size: clamp(24px, 1.8vw, 32px);
  font-weight: 880;
  line-height: 0.98;
  letter-spacing: -0.04em;
}

.verification-filter-strip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 4px;
  border: 1px solid var(--verification-glass-border);
  border-radius: 16px;
  background:
    linear-gradient(145deg, var(--verification-glass-bg), var(--verification-glass-bg-strong));
  box-shadow: var(--verification-glass-shadow);
  backdrop-filter: blur(18px) saturate(130%);
  -webkit-backdrop-filter: blur(18px) saturate(130%);
  overflow-x: auto;
}

.verification-status-filter-button {
  min-height: 32px;
  border-radius: 12px !important;
  white-space: nowrap;
}

.verification-status-filter-button.is-active {
  box-shadow: 0 10px 26px color-mix(in srgb, var(--ui-primary-main) 12%, transparent);
}

.client-verification__anchors {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.verification-timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-timeline-card.is-highlighted {
  border-color: color-mix(in srgb, var(--ui-primary-main) 48%, var(--color-stroke-ui-light));
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--ui-primary-main) 20%, transparent),
    0 22px 62px color-mix(in srgb, var(--ui-primary-main) 14%, #000000 18%);
}

.verification-timeline-card.is-unread {
  border-color: color-mix(in srgb, var(--color-warning) 48%, var(--color-stroke-ui-light));
}

.verification-timeline-card__inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.verification-timeline-card__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  gap: 11px;
  align-items: flex-start;
}

.verification-timeline-card__identity {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.verification-timeline-card__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: var(--verification-accent);
  background: color-mix(in srgb, var(--verification-accent) 13%, transparent);
}

.verification-timeline-card__main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.verification-timeline-card__main h3 {
  margin: 0;
  color: var(--ui-text-main);
  font-size: 16px;
  font-weight: 840;
  line-height: 1.18;
  letter-spacing: -0.02em;
}

.verification-timeline-card__review {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 7px;
}

.verification-timeline-card__status {
  display: flex;
  justify-content: flex-end;
}

.verification-decision-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 70%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 44%, transparent);
}

.verification-decision-group :deep(.p-button) {
  min-height: 30px;
  padding: 6px 10px;
  border-radius: 11px;
  font-size: 11px;
  font-weight: 820;
}

.verification-timeline-card__main p {
  margin: 0;
  color: var(--ui-text-secondary);
  font-size: 12px;
  line-height: 1.42;
}

.verification-timeline-card__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 650;
}

.verification-timeline-card__meta span:not(:last-child)::after {
  content: "·";
  margin-left: 7px;
  color: color-mix(in srgb, var(--ui-text-secondary) 70%, transparent);
}

.verification-inline-status {
  --status-color: var(--ui-text-secondary);

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  color: var(--status-color);
  font-size: 12px;
  font-weight: 760;
  line-height: 1.2;
  white-space: nowrap;
}

.verification-inline-status__dot {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 999px;
  background: var(--status-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-color) 15%, transparent);
}

.verification-inline-status--approved,
.verification-inline-status--success {
  --status-color: var(--color-success);
}

.verification-inline-status--pending,
.verification-inline-status--warning {
  --status-color: var(--color-warning);
}

.verification-inline-status--rejected,
.verification-inline-status--danger {
  --status-color: var(--color-danger);
}

.verification-change-grid {
  display: grid;
  gap: 7px;
}

.verification-change-row {
  display: grid;
  grid-template-columns: minmax(130px, 0.7fr) minmax(0, 1fr) 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 9px;
  border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 70%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 48%, transparent);
}

.verification-change-row__field {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 760;
}

.verification-change-row__value {
  min-width: 0;
  overflow: hidden;
  color: var(--ui-text-main);
  font-size: 12px;
  font-weight: 780;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verification-change-row__value.is-old {
  color: var(--ui-text-secondary);
}

.verification-change-row__value.is-new {
  color: var(--ui-text-main);
}

.verification-change-row .pi {
  color: var(--ui-primary-main);
  font-size: 11px;
}

.verification-field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.verification-field-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-height: 62px;
  padding: 10px;
  border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 70%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 48%, transparent);
}

.verification-field-card span {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 720;
}

.verification-field-card strong {
  color: var(--ui-text-main);
  font-size: 12px;
  font-weight: 800;
  word-break: break-word;
}

.verification-document-strip {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 8px;
}

.verification-document-chip {
  min-width: 180px;
  max-width: 260px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 9px;
  padding: 7px;
  border: 1px solid color-mix(in srgb, var(--color-stroke-ui-light) 70%, transparent);
  border-radius: 14px;
  background: color-mix(in srgb, var(--ui-background-card) 48%, transparent);
  color: var(--ui-text-main);
  text-align: left;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease;
}

.verification-document-chip:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--ui-primary-main) 28%, var(--color-stroke-ui-light));
  background: color-mix(in srgb, var(--ui-primary-main) 7%, var(--ui-background-card));
}

.verification-document-chip img,
.verification-document-chip .verification-file-badge {
  width: 42px;
  height: 42px;
  border-radius: 11px;
}

.verification-document-chip img {
  object-fit: cover;
}

.verification-document-chip > span:last-child {
  min-width: 0;
  overflow: hidden;
  font-size: 12px;
  font-weight: 760;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verification-file-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-text-main);
  background: color-mix(in srgb, var(--ui-primary-main) 9%, var(--ui-background-card));
  font-size: 10px;
  font-weight: 860;
  letter-spacing: 0.06em;
}

.verification-file-badge.is-pdf {
  color: var(--color-danger);
}

.verification-file-badge.is-text {
  color: var(--color-info);
}

.verification-file-badge.is-file {
  color: var(--ui-text-secondary);
}

.verification-empty-card__body {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px;
  color: var(--ui-text-secondary);
  text-align: center;
}

.verification-empty-card__body .pi {
  color: var(--color-success);
  font-size: 30px;
}

.verification-empty-card__body strong {
  color: var(--ui-text-main);
  font-size: 17px;
  font-weight: 840;
}

.verification-empty-card__body span {
  max-width: 420px;
  font-size: 13px;
  line-height: 1.45;
}

.verification-timeline__load {
  align-self: center;
  padding: 6px 0;
  color: var(--ui-primary-main);
  font-size: 13px;
  font-weight: 820;
}

.verification-timeline__load:hover {
  text-decoration: underline;
}

@keyframes verification-glass-glint {
  0% {
    opacity: 0;
    transform: rotate(10deg) translateX(-50%);
  }
  35% {
    opacity: 0.16;
  }
  100% {
    opacity: 0;
    transform: rotate(10deg) translateX(330%);
  }
}

@media (max-width: 1180px) {
  .client-verification__summary-grid,
  .verification-field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .client-verification__header,
  .verification-timeline-card__top {
    flex-direction: column;
    align-items: flex-start;
  }

  .client-verification__header {
    display: flex;
  }

  .verification-timeline-card__top {
    display: flex;
  }

  .verification-timeline-card__review {
    align-items: flex-start;
    width: 100%;
  }

  .verification-decision-group {
    width: 100%;
  }

  .verification-decision-group :deep(.p-button) {
    flex: 1 1 0;
  }

  .client-verification__header-actions {
    justify-content: flex-start;
  }

  .verification-change-row {
    grid-template-columns: 1fr;
  }

  .verification-change-row .pi {
    transform: rotate(90deg);
  }
}

@media (max-width: 640px) {
  .client-verification {
    padding: 12px;
  }

  .client-verification__summary-grid,
  .verification-field-grid {
    grid-template-columns: 1fr;
  }

  .verification-filter-strip {
    width: 100%;
  }

  .verification-timeline-card__top {
    grid-template-columns: 1fr;
  }

  .verification-timeline-card__identity {
    grid-template-columns: 1fr;
  }

  .verification-document-chip {
    width: 100%;
    max-width: none;
  }
}
</style>
