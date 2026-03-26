<template>
  <div class="verification-queue-page">
    <div class="verification-queue-page__stats">
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
    </div>

    <div class="verification-queue-page__toolbar">
      <UiInput
        class="verification-queue-page__search"
        :value="searchInput"
        placeholder="Search by client, email or request ID"
        @input="handleInputSearch"
      >
        <template #icon-left>
          <UiIconSearch />
        </template>
      </UiInput>

      <div class="verification-queue-page__toolbar-controls">
        <UiSelect
          class="verification-queue-page__sort"
          :data="sortOptions"
          :value="sortKey"
          without-no-select
          @change="handleSortChange"
        >
          <template #icon-left>
            <UiIconSortBy />
          </template>
        </UiSelect>

        <UiButtonDefault state="info--small" class="!w-[42px]" @click="handleRefreshAll">
          <UiIconUpdate :spinning="isLoading" />
        </UiButtonDefault>
      </div>
    </div>

    <div
      v-if="requestStateFilter !== 'all'"
      class="verification-queue-page__active-filter"
    >
      <span>Filter: {{ requestStateText(requestStateFilter) }}</span>
      <button type="button" @click="handleRequestStateFilter('all')">Reset</button>
    </div>

    <div
      v-if="errorMessage"
      class="verification-queue-page__state verification-queue-page__state--error"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="isLoading && requestItems.length === 0"
      class="verification-queue-page__state"
    >
      <UiIconSpinnerDefault />
    </div>

    <div
      v-else-if="requestItems.length === 0"
      class="verification-queue-page__state"
    >
      No verification requests found.
    </div>

    <div
      v-else
      class="verification-request-list"
    >
      <article
        v-for="requestItem in requestItems"
        :key="requestItem.id"
        class="verification-request-row"
        :class="{ 'is-pending-row': requestItem.request_state === 'pending' }"
        @click="openClientVerification(requestItem)"
      >
        <div class="verification-request-row__identity">
          <UiImageCircle
            :src="requestItem.user.photo_url || ''"
            :two-chars="displayClientInitials(requestItem)"
          />

          <div class="verification-request-row__identity-meta">
            <div class="verification-request-row__name-line">
              <span class="verification-request-row__name">{{ displayClientName(requestItem) }}</span>
              <span
                class="verification-request-badge"
                :class="requestStateClass(requestItem.request_state)"
              >
                {{ requestStateText(requestItem.request_state) }}
              </span>
              <span
                class="verification-request-badge verification-request-badge--overall"
                :class="statusClass(requestItem.state)"
              >
                {{ overallStatusText(requestItem.state) }}
              </span>
            </div>

            <div class="verification-request-row__meta">
              <span>{{ requestItem.user.email || "-" }}</span>
              <span>· #{{ shortId(requestItem.id) }}</span>
              <span>· {{ requestItem.updated_at_human || "-" }}</span>
            </div>

            <div class="verification-request-row__focus">
              <template v-if="reviewFocusItems(detailState(requestItem.user_id)).length">
                <span
                  v-for="item in reviewFocusItems(detailState(requestItem.user_id))"
                  :key="`${requestItem.id}:${item}`"
                  class="verification-focus-chip"
                >
                  {{ item }}
                </span>
              </template>
              <span
                v-else
                class="verification-request-row__focus-muted"
              >
                No new sections marked for review
              </span>
            </div>
          </div>
        </div>

        <div class="verification-request-row__summary">
          <div class="verification-summary-card">
            <div class="verification-summary-card__label">
              <UiIconProfile />
              <span>Profile</span>
            </div>
            <div
              class="verification-summary-card__value"
              :class="statusClass(detailState(requestItem.user_id).verification.info.verification_status)"
            >
              {{ statusText(detailState(requestItem.user_id).verification.info.verification_status) }}
            </div>
          </div>

          <div class="verification-summary-card">
            <div class="verification-summary-card__label">
              <UiIconDocuments />
              <span>Documents</span>
            </div>
            <div class="verification-summary-card__value">
              {{ documentsSummary(detailState(requestItem.user_id)) }}
            </div>
            <div
              v-if="documentPreviews(detailState(requestItem.user_id)).length"
              class="verification-summary-card__previews"
            >
              <span
                v-for="(preview, previewIndex) in documentPreviews(detailState(requestItem.user_id))"
                :key="`${requestItem.id}:doc:${previewIndex}`"
                class="verification-summary-card__preview"
              >
                <img
                  v-if="preview"
                  :src="preview"
                  alt="Document preview"
                />
                <span v-else>DOC</span>
              </span>
            </div>
          </div>

          <div class="verification-summary-card">
            <div class="verification-summary-card__label">
              <UiIconPaymentDetail />
              <span>Requisites</span>
            </div>
            <div class="verification-summary-card__value">
              {{ requisitesSummary(detailState(requestItem.user_id)) }}
            </div>
            <div
              v-if="requisitePreviews(detailState(requestItem.user_id)).length"
              class="verification-summary-card__previews"
            >
              <span
                v-for="(preview, previewIndex) in requisitePreviews(detailState(requestItem.user_id))"
                :key="`${requestItem.id}:requisite:${previewIndex}`"
                class="verification-summary-card__preview"
              >
                <img
                  v-if="preview"
                  :src="preview"
                  alt="Requisite preview"
                />
                <span v-else>DOC</span>
              </span>
            </div>
          </div>

          <div class="verification-summary-card">
            <div class="verification-summary-card__label">
              <UiIconPaymentDetail />
              <span>First payment</span>
            </div>
            <div
              class="verification-summary-card__value"
              :class="detailState(requestItem.user_id).firstDeposit ? 'is-approved' : 'is-pending'"
            >
              {{ firstPaymentSummary(detailState(requestItem.user_id)) }}
            </div>
            <div class="verification-summary-card__subvalue">
              {{ paymentMethodName(detailState(requestItem.user_id).firstDeposit) }}
            </div>
          </div>
        </div>

        <div
          class="verification-request-row__actions"
          @click.stop
        >
          <VerificationRequestStateActions
            :state="requestItem.request_state"
            :disabled="isUpdating(requestItem.id)"
            @update-state="handleRequestReviewUpdate(requestItem, $event)"
          />

          <button
            type="button"
            class="verification-request-row__open"
            :title="'Open client verification'"
            @click.stop="openClientVerification(requestItem)"
          >
            Open
          </button>
        </div>
      </article>
    </div>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage"
    />
  </div>
</template>

<script lang="ts" setup>
import { useLocalePath, navigateTo } from "~/.nuxt/imports";
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import VerificationRequestStateActions from "~/components/block/verification/VerificationRequestStateActions.vue";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";

type RequestReviewState = "pending" | "viewed" | "approved" | "rejected";
type VerificationStatus = "pending" | "approved" | "rejected";

interface VerificationRequestItem {
  id: string;
  user_id: string;
  state: VerificationStatus;
  request_state: RequestReviewState;
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

interface VerificationSectionData {
  verification_status: VerificationStatus;
  comment: string;
}

interface VerificationPayloadData {
  info: VerificationSectionData;
  documents: VerificationSectionData;
}

interface ClientPayload {
  id: string;
  first_name: string;
  mid_name: string;
  last_name: string;
  email: string;
  birthdate: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  address: string;
  postal_code: string;
  photo_url: string;
}

interface VerificationDocumentRow {
  id: string;
  name: string;
  comment: string;
  state: VerificationStatus;
  updated_at: string;
  document_data: {
    number: string;
    full_url: string;
  };
}

interface PaymentDetailDocument {
  name: string;
  path: string;
  preview_url: string;
  previewUrl: string;
}

interface PaymentDetailRow {
  id: string;
  name: string;
  status: VerificationStatus;
  payment_system_name: string;
  updated_at: string;
  admin_comment: string;
  documents: PaymentDetailDocument[];
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

interface DetailState {
  isLoading: boolean;
  loaded: boolean;
  error: string;
  user: ClientPayload | null;
  verification: VerificationPayloadData;
  documents: VerificationDocumentRow[];
  paymentDetails: PaymentDetailRow[];
  firstDeposit: PaymentRow | null;
}

const emit = defineEmits<{
  (e: "loading", value: boolean): void;
}>();

const appCore = useAppCore();
const localePath = useLocalePath();
const toast = useToast();

const page = ref(1);
const perPage = ref(5);
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
  viewed: 0,
  approved: 0,
  rejected: 0,
});
const detailStates = reactive<Record<string, DetailState>>({});
const updatingState = reactive<Record<string, boolean>>({});

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const createDefaultVerificationSection = (): VerificationSectionData => ({
  verification_status: "pending",
  comment: "",
});

const createDefaultVerificationPayload = (): VerificationPayloadData => ({
  info: createDefaultVerificationSection(),
  documents: createDefaultVerificationSection(),
});

const createEmptyDetailState = (): DetailState => ({
  isLoading: false,
  loaded: false,
  error: "",
  user: null,
  verification: createDefaultVerificationPayload(),
  documents: [],
  paymentDetails: [],
  firstDeposit: null,
});

const sortOptions = [
  { id: "updated_desc", value: "updated_desc", text: "Newest first" },
  { id: "updated_asc", value: "updated_asc", text: "Oldest first" },
  { id: "client_asc", value: "client_asc", text: "Client name A-Z" },
  { id: "client_desc", value: "client_desc", text: "Client name Z-A" },
  { id: "request_state", value: "request_state", text: "Request state" },
];

const statCards = computed(() => [
  { id: "all", filter: "all" as const, label: "All", value: formatCount(summary.all) },
  { id: "pending", filter: "pending" as const, label: "Unprocessed", value: formatCount(summary.pending) },
  { id: "viewed", filter: "viewed" as const, label: "Viewed", value: formatCount(summary.viewed) },
  { id: "approved", filter: "approved" as const, label: "Confirmed", value: formatCount(summary.approved) },
  { id: "rejected", filter: "rejected" as const, label: "Cancelled", value: formatCount(summary.rejected) },
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
  if (normalized === "viewed" || normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const detailState = (userId: string): DetailState => {
  if (!detailStates[userId]) {
    detailStates[userId] = createEmptyDetailState();
  }

  return detailStates[userId];
};

const isUpdating = (requestId: string): boolean => Boolean(updatingState[requestId]);

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

const formatCount = (value: number): string => new Intl.NumberFormat("en-US").format(Number(value || 0));

const statusText = (status: VerificationStatus): string => {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    default:
      return "Pending";
  }
};

const overallStatusText = (status: VerificationStatus): string => {
  switch (status) {
    case "approved":
      return "Overall approved";
    case "rejected":
      return "Needs attention";
    default:
      return "In review";
  }
};

const requestStateText = (state: "all" | RequestReviewState): string => {
  switch (state) {
    case "all":
      return "All";
    case "viewed":
      return "Viewed";
    case "approved":
      return "Confirmed";
    case "rejected":
      return "Cancelled";
    default:
      return "Unprocessed";
  }
};

const statusClass = (status: VerificationStatus): string => `is-${normalizeVerificationStatus(status)}`;
const requestStateClass = (state: RequestReviewState): string => `is-${normalizeRequestReviewState(state)}`;

const normalizeVerificationPayload = (payload: any): VerificationPayloadData => ({
  info: {
    verification_status: normalizeVerificationStatus(payload?.info?.verification_status),
    comment: String(payload?.info?.comment ?? ""),
  },
  documents: {
    verification_status: normalizeVerificationStatus(payload?.documents?.verification_status),
    comment: String(payload?.documents?.comment ?? ""),
  },
});

const normalizeUserPayload = (payload: any): ClientPayload => ({
  id: String(payload?.id ?? ""),
  first_name: String(payload?.first_name ?? ""),
  mid_name: String(payload?.mid_name ?? ""),
  last_name: String(payload?.last_name ?? ""),
  email: String(payload?.email ?? ""),
  birthdate: String(payload?.birthdate ?? ""),
  phone: String(payload?.phone ?? ""),
  country: String(payload?.country ?? ""),
  state: String(payload?.state ?? ""),
  city: String(payload?.city ?? ""),
  address: String(payload?.address ?? ""),
  postal_code: String(payload?.postal_code ?? ""),
  photo_url: String(payload?.photo_url ?? payload?.photo_path ?? ""),
});

const normalizeVerificationDocuments = (payload: any): VerificationDocumentRow[] =>
  Array.isArray(payload)
    ? payload.map((row: any) => ({
        id: String(row?.id ?? ""),
        name: String(row?.name ?? ""),
        comment: String(row?.comment ?? ""),
        state: normalizeVerificationStatus(row?.state),
        updated_at: String(row?.updated_at ?? ""),
        document_data: {
          number: String(row?.document_data?.number ?? ""),
          full_url: String(row?.document_data?.full_url ?? ""),
        },
      }))
    : [];

const normalizePaymentDetails = (payload: any): PaymentDetailRow[] =>
  Array.isArray(payload)
    ? payload.map((row: any) => ({
        id: String(row?.id ?? ""),
        name: String(row?.name ?? ""),
        status: normalizeVerificationStatus(row?.status),
        payment_system_name: String(row?.payment_system_name ?? row?.payment_system?.name ?? ""),
        updated_at: String(row?.updated_at ?? ""),
        admin_comment: String(row?.admin_comment ?? ""),
        documents: Array.isArray(row?.documents)
          ? row.documents.map((document: any) => ({
              name: String(document?.name ?? ""),
              path: String(document?.path ?? ""),
              preview_url: String(document?.preview_url ?? ""),
              previewUrl: String(document?.previewUrl ?? ""),
            }))
          : [],
      }))
    : [];

const normalizePayments = (payload: any): PaymentRow[] =>
  Array.isArray(payload)
    ? payload.map((row: any) => ({
        id: String(row?.id ?? ""),
        type: String(row?.type ?? ""),
        status: String(row?.status ?? ""),
        amount: Number(row?.amount ?? 0),
        currency: String(row?.currency ?? "USD"),
        created_at: String(row?.created_at ?? ""),
        payment_gateway: String(row?.payment_gateway ?? ""),
        payment_system_name: String(row?.payment_system_name ?? ""),
        legacy_payment_system_name: String(row?.legacy_payment_system_name ?? ""),
      }))
    : [];

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
      viewed: Number(payload?.summary?.viewed ?? 0),
      approved: Number(payload?.summary?.approved ?? 0),
      rejected: Number(payload?.summary?.rejected ?? 0),
    });

    void Promise.allSettled(requestItems.value.map(item => loadRequestDetailBundle(item)));
  } catch (error: any) {
    totalRows.value = 0;
    requestItems.value = [];
    errorMessage.value = error?.response?.data?.message || "Failed to load verification requests.";
  } finally {
    isLoading.value = false;
    emit("loading", false);
  }
};

const loadRequestDetailBundle = async (requestItem: VerificationRequestItem, force = false): Promise<void> => {
  const state = detailState(requestItem.user_id);
  if ((state.loaded || state.isLoading) && !force) {
    return;
  }

  state.isLoading = true;
  state.error = "";

  const [clientResult, verificationResult, documentsResult, paymentDetailsResult, paymentsResult] = await Promise.allSettled([
    appCore.adminModules.clients.getById(requestItem.user_id),
    appCore.adminModules.verificationRequests.get(requestItem.user_id),
    appCore.adminModules.documents.get({ clientId: requestItem.user_id }),
    appCore.adminModules.clients.getPaymentDetails(requestItem.user_id),
    appCore.payments.get({
      page: 1,
      perPage: 1,
      orderBy: "created_at",
      orderDirection: "asc",
      ["filters[user_id]"]: requestItem.user_id,
      ["filters[type]"]: "deposit",
    }),
  ]);

  try {
    if (clientResult.status === "fulfilled") {
      state.user = normalizeUserPayload(clientResult.value?.data?.data ?? {});
    }

    if (verificationResult.status === "fulfilled") {
      const verificationRow = Array.isArray(verificationResult.value?.data?.data)
        ? verificationResult.value.data.data[0]
        : null;
      state.verification = normalizeVerificationPayload(verificationRow?.data ?? {});
    }

    if (documentsResult.status === "fulfilled") {
      state.documents = normalizeVerificationDocuments(documentsResult.value?.data?.data ?? []);
    }

    if (paymentDetailsResult.status === "fulfilled") {
      state.paymentDetails = normalizePaymentDetails(paymentDetailsResult.value?.data?.data ?? []);
    }

    if (paymentsResult.status === "fulfilled") {
      const paymentRows = normalizePayments(paymentsResult.value?.data?.data?.data ?? []);
      state.firstDeposit = paymentRows[0] ?? null;
    }

    const firstRejected = [clientResult, verificationResult, documentsResult, paymentDetailsResult, paymentsResult]
      .find(result => result.status === "rejected") as PromiseRejectedResult | undefined;

    if (firstRejected) {
      state.error = String((firstRejected.reason as any)?.response?.data?.message ?? "Some sections failed to load.");
    }

    state.loaded = true;
  } finally {
    state.isLoading = false;
  }
};

const handleInputSearch = (value: string): void => {
  searchInput.value = value;
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

const handleChangePerPage = async (value: number): Promise<void> => {
  perPage.value = value;
  page.value = 1;
  await loadList();
};

const handleChangePage = async (value: number): Promise<void> => {
  page.value = value;
  await loadList();
};

const handleRefreshAll = async (): Promise<void> => {
  Object.keys(detailStates).forEach(key => {
    detailStates[key].loaded = false;
  });

  await loadList();
};

const handleRequestReviewUpdate = async (
  requestItem: VerificationRequestItem,
  nextState: Exclude<RequestReviewState, "pending">
): Promise<void> => {
  updatingState[requestItem.id] = true;

  try {
    await appCore.adminModules.verificationRequests.put(requestItem.id, {
      type: "request",
      updatedStatus: { status: nextState, comment: "" },
    });

    toast.success("Request status updated.");
    await loadList();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update request status.");
  } finally {
    delete updatingState[requestItem.id];
  }
};

const hasPendingProfile = (state: DetailState): boolean =>
  state.verification.info.verification_status === "pending";

const hasPendingDocuments = (state: DetailState): boolean =>
  state.verification.documents.verification_status === "pending"
  || state.documents.some(document => document.state === "pending");

const hasPendingRequisites = (state: DetailState): boolean =>
  state.paymentDetails.some(paymentDetail => paymentDetail.status === "pending");

const reviewFocusItems = (state: DetailState): string[] => {
  if (!state.loaded && state.isLoading) {
    return ["Loading"];
  }

  const items: string[] = [];

  if (hasPendingProfile(state)) {
    items.push("Profile");
  }

  if (hasPendingDocuments(state)) {
    items.push(`Documents${state.documents.length ? ` (${state.documents.length})` : ""}`);
  }

  if (hasPendingRequisites(state)) {
    items.push(`Requisites${state.paymentDetails.length ? ` (${state.paymentDetails.length})` : ""}`);
  }

  return items;
};

const documentsSummary = (state: DetailState): string => {
  if (!state.loaded && state.isLoading) {
    return "Loading";
  }

  if (state.documents.length === 0) {
    return "No docs";
  }

  return `${state.documents.length} doc${state.documents.length > 1 ? "s" : ""}`;
};

const requisitesSummary = (state: DetailState): string => {
  if (!state.loaded && state.isLoading) {
    return "Loading";
  }

  if (state.paymentDetails.length === 0) {
    return "No requisites";
  }

  return `${state.paymentDetails.length} item${state.paymentDetails.length > 1 ? "s" : ""}`;
};

const firstPaymentSummary = (state: DetailState): string => {
  if (!state.loaded && state.isLoading) {
    return "Checking";
  }

  return state.firstDeposit ? "Recorded" : "No deposit";
};

const documentPreviews = (state: DetailState): string[] =>
  state.documents
    .map(document => String(document.document_data.full_url || "").trim())
    .filter(Boolean)
    .slice(0, 2);

const resolvePaymentDetailPreview = (document: PaymentDetailDocument): string =>
  String(document.preview_url || document.previewUrl || "").trim();

const requisitePreviews = (state: DetailState): string[] =>
  state.paymentDetails
    .flatMap(paymentDetail => paymentDetail.documents)
    .map(resolvePaymentDetailPreview)
    .filter(Boolean)
    .slice(0, 2);

const paymentMethodName = (payment: PaymentRow | null): string => {
  if (!payment) {
    return "-";
  }

  return (
    String(payment.legacy_payment_system_name || "").trim()
    || String(payment.payment_system_name || "").trim()
    || String(payment.payment_gateway || "").trim()
    || "Deposit"
  );
};

const resolveTargetVerificationTab = (requestItem: VerificationRequestItem): "client" | "payout" => {
  const state = detailState(requestItem.user_id);
  const shouldOpenPayout = hasPendingRequisites(state) && !hasPendingProfile(state) && !hasPendingDocuments(state);

  return shouldOpenPayout ? "payout" : "client";
};

const openClientVerification = (requestItem: VerificationRequestItem): void => {
  navigateTo(localePath(`/clients/${requestItem.user_id}?tab=2&verificationTab=${resolveTargetVerificationTab(requestItem)}`));
};

onMounted(() => {
  void loadList();
});

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});

defineExpose({
  reload: handleRefreshAll,
});
</script>

<style lang="scss" scoped>
.verification-queue-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.verification-queue-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.verification-stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 78px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(73, 108, 222, 0.18);
  background: linear-gradient(180deg, rgba(10, 21, 74, 0.9), rgba(7, 17, 62, 0.96));
  color: var(--ui-text-main);
  text-align: left;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.verification-stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(73, 108, 222, 0.34);
}

.verification-stat-card.is-active {
  border-color: rgba(73, 108, 222, 0.7);
  box-shadow: 0 0 0 1px rgba(73, 108, 222, 0.22);
}

.verification-stat-card__label {
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-stat-card__value {
  font-size: 1.45rem;
  line-height: 1;
  font-weight: 700;
}

.verification-queue-page__toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.verification-queue-page__search {
  flex: 1 1 auto;
}

.verification-queue-page__toolbar-controls {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
}

.verification-queue-page__sort {
  min-width: 220px;
}

.verification-queue-page__active-filter,
.verification-queue-page__state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 15px;
  border-radius: 14px;
  border: 1px solid var(--color-stroke-ui-light);
  background: rgba(8, 18, 66, 0.62);
  color: var(--ui-text-main);
}

.verification-queue-page__active-filter button {
  color: var(--ui-primary-main);
}

.verification-queue-page__state {
  justify-content: center;
}

.verification-queue-page__state--error {
  justify-content: flex-start;
}

.verification-request-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.verification-request-row {
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(0, 1.6fr) auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(73, 108, 222, 0.16);
  background:
    radial-gradient(circle at top right, rgba(41, 75, 196, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(9, 20, 73, 0.96), rgba(6, 16, 59, 0.98));
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.verification-request-row:hover {
  transform: translateY(-1px);
  border-color: rgba(73, 108, 222, 0.34);
  box-shadow: 0 12px 32px rgba(3, 9, 34, 0.18);
}

.verification-request-row.is-pending-row {
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-request-row__identity {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.verification-request-row__identity-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.verification-request-row__name-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.verification-request-row__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-request-row__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-request-row__focus {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.verification-request-row__focus-muted {
  font-size: 0.78rem;
  color: var(--ui-text-secondary);
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

.verification-request-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-main);
  font-size: 0.74rem;
  font-weight: 600;
}

.verification-request-badge.is-pending {
  background: rgba(233, 174, 0, 0.14);
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-request-badge.is-viewed {
  background: rgba(73, 108, 222, 0.14);
  border-color: rgba(73, 108, 222, 0.24);
}

.verification-request-badge.is-approved {
  background: rgba(22, 163, 74, 0.16);
  border-color: rgba(22, 163, 74, 0.28);
}

.verification-request-badge.is-rejected {
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(220, 38, 38, 0.28);
}

.verification-request-badge--overall {
  opacity: 0.82;
}

.verification-request-row__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  min-width: 0;
}

.verification-summary-card {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-height: 88px;
  padding: 11px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-summary-card__label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--ui-text-secondary);
}

.verification-summary-card__label svg {
  width: 12px;
  height: 12px;
}

.verification-summary-card__value {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--ui-text-main);
}

.verification-summary-card__value.is-approved {
  color: var(--ui-sticker-success);
}

.verification-summary-card__value.is-rejected {
  color: var(--ui-sticker-danger);
}

.verification-summary-card__value.is-pending {
  color: #e9ae00;
}

.verification-summary-card__subvalue {
  font-size: 0.74rem;
  color: var(--ui-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.verification-summary-card__previews {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
}

.verification-summary-card__preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.62rem;
  color: var(--ui-text-secondary);
}

.verification-summary-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-request-row__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.verification-request-row__open {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(73, 108, 222, 0.22);
  background: rgba(73, 108, 222, 0.12);
  color: var(--ui-text-main);
  font-size: 0.76rem;
  font-weight: 600;
}

@media (max-width: 1320px) {
  .verification-request-row {
    grid-template-columns: 1fr;
  }

  .verification-request-row__actions {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

@media (max-width: 860px) {
  .verification-queue-page__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .verification-queue-page__toolbar-controls {
    width: 100%;
    justify-content: space-between;
  }

  .verification-queue-page__sort {
    min-width: 0;
    flex: 1 1 auto;
  }

  .verification-request-row__summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .verification-request-row__summary {
    grid-template-columns: 1fr;
  }
}
</style>
