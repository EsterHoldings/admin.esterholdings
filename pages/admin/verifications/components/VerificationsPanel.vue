<template>
  <div class="verification-review-page">
    <div class="verification-review-page__stats">
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

    <div class="verification-review-page__toolbar">
      <UiInput
        class="verification-review-page__search"
        :value="searchInput"
        placeholder="Search by client, email or request ID"
        @input="handleInputSearch"
      >
        <template #icon-left>
          <UiIconSearch />
        </template>
      </UiInput>

      <div class="verification-review-page__toolbar-controls">
        <UiSelect
          class="verification-review-page__sort"
          :data="sortOptions"
          :value="sortKey"
          without-no-select
          @change="handleSortChange"
        >
          <template #icon-left>
            <UiIconSortBy />
          </template>
        </UiSelect>

        <UiButtonDefault state="info--small" class="!w-[44px]" @click="handleRefreshAll">
          <UiIconUpdate :spinning="isLoading" />
        </UiButtonDefault>
      </div>
    </div>

    <div
      v-if="requestStateFilter !== 'all'"
      class="verification-review-page__active-filter"
    >
      <span>Filter: {{ requestStateText(requestStateFilter) }}</span>
      <button type="button" @click="handleRequestStateFilter('all')">Reset</button>
    </div>

    <div
      v-if="errorMessage"
      class="verification-review-page__error"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="isLoading && requestItems.length === 0"
      class="verification-review-page__loading"
    >
      <UiIconSpinnerDefault />
    </div>

    <div
      v-else-if="requestItems.length === 0"
      class="verification-review-page__empty"
    >
      No verification requests found.
    </div>

    <div
      v-else
      class="verification-review-list"
    >
      <article
        v-for="requestItem in requestItems"
        :key="requestItem.id"
        class="verification-review-card"
      >
        <div
          class="verification-review-card__hero"
          @click="openClientVerification(requestItem.user_id)"
        >
          <div class="verification-review-card__identity">
            <UiImageCircle
              :src="requestItem.user.photo_url || ''"
              :two-chars="requestItem.user.initials || 'AA'"
            />

            <div class="verification-review-card__identity-meta">
              <div class="verification-review-card__identity-name">
                {{ displayClientName(requestItem) }}
              </div>
              <div class="verification-review-card__identity-subtitle">
                <span>{{ requestItem.user.email || "-" }}</span>
                <span v-if="detailState(requestItem.user_id).user?.phone">· {{ detailState(requestItem.user_id).user?.phone }}</span>
                <span>· #{{ shortId(requestItem.id) }}</span>
              </div>
              <div class="verification-review-card__identity-badges">
                <span class="verification-badge verification-badge--overall" :class="statusClass(requestItem.state)">
                  {{ overallStatusText(requestItem.state) }}
                </span>
                <span class="verification-badge verification-badge--request" :class="requestStateClass(requestItem.request_state)">
                  {{ requestStateText(requestItem.request_state) }}
                </span>
                <span class="verification-badge verification-badge--muted">
                  Updated {{ requestItem.updated_at_human || "-" }}
                </span>
              </div>
            </div>
          </div>

          <div class="verification-review-card__hero-side">
            <div class="verification-review-card__request-actions" @click.stop>
              <button
                type="button"
                class="verification-request-action verification-request-action--viewed"
                :class="{ 'is-active': requestItem.request_state === 'viewed' }"
                @click="handleRequestReviewUpdate(requestItem, 'viewed')"
              >
                <UiIconEye />
                <span>Viewed</span>
              </button>
              <button
                type="button"
                class="verification-request-action verification-request-action--approved"
                :class="{ 'is-active': requestItem.request_state === 'approved' }"
                @click="handleRequestReviewUpdate(requestItem, 'approved')"
              >
                <UiIconSuccess />
                <span>Confirmed</span>
              </button>
              <button
                type="button"
                class="verification-request-action verification-request-action--rejected"
                :class="{ 'is-active': requestItem.request_state === 'rejected' }"
                @click="handleRequestReviewUpdate(requestItem, 'rejected')"
              >
                <UiIconFailed />
                <span>Cancelled</span>
              </button>
            </div>

            <button
              type="button"
              class="verification-review-card__open-btn"
              @click.stop="openClientVerification(requestItem.user_id)"
            >
              <span>Open client</span>
              <UiIconArrowRightShort />
            </button>
          </div>
        </div>

        <div class="verification-review-card__body">
          <div
            v-if="detailState(requestItem.user_id).isLoading"
            class="verification-review-card__detail-loading"
          >
            <UiIconSpinnerDefault />
          </div>

          <div
            v-else-if="detailState(requestItem.user_id).error"
            class="verification-review-card__detail-error"
          >
            <span>{{ detailState(requestItem.user_id).error }}</span>
            <button type="button" @click="loadRequestDetailBundle(requestItem, true)">Retry</button>
          </div>

          <template v-else>
            <div class="verification-review-card__top-grid">
              <section class="verification-section verification-section--profile">
                <div class="verification-section__header">
                  <div class="verification-section__title-wrap">
                    <UiIconProfile />
                    <span>Client profile</span>
                  </div>
                  <VerificationActions
                    :status="detailState(requestItem.user_id).verification.info.verification_status"
                    :disabled="isUpdating(requestItem.id)"
                    @update-status="handleVerificationStepUpdate(requestItem, 'info', $event)"
                  />
                </div>

                <div class="verification-data-grid">
                  <div class="verification-data-grid__item">
                    <span class="verification-data-grid__key">Full name</span>
                    <span class="verification-data-grid__value">{{ fullClientName(detailState(requestItem.user_id).user) }}</span>
                  </div>
                  <div class="verification-data-grid__item">
                    <span class="verification-data-grid__key">Birthdate</span>
                    <span class="verification-data-grid__value">{{ detailState(requestItem.user_id).user?.birthdate || "-" }}</span>
                  </div>
                  <div class="verification-data-grid__item">
                    <span class="verification-data-grid__key">Phone</span>
                    <span class="verification-data-grid__value">{{ detailState(requestItem.user_id).user?.phone || "-" }}</span>
                  </div>
                  <div class="verification-data-grid__item">
                    <span class="verification-data-grid__key">Email</span>
                    <span class="verification-data-grid__value">{{ detailState(requestItem.user_id).user?.email || "-" }}</span>
                  </div>
                  <div class="verification-data-grid__item verification-data-grid__item--wide">
                    <span class="verification-data-grid__key">Address</span>
                    <span class="verification-data-grid__value">{{ formatAddress(detailState(requestItem.user_id).user) }}</span>
                  </div>
                </div>

                <div
                  v-if="detailState(requestItem.user_id).verification.info.comment"
                  class="verification-section__note"
                >
                  {{ detailState(requestItem.user_id).verification.info.comment }}
                </div>
              </section>

              <section class="verification-section verification-section--address">
                <div class="verification-section__header">
                  <div class="verification-section__title-wrap">
                    <UiIconInfo />
                    <span>Address verification</span>
                  </div>
                  <VerificationActions
                    :status="detailState(requestItem.user_id).verification.address.verification_status"
                    :disabled="isUpdating(requestItem.id)"
                    @update-status="handleVerificationStepUpdate(requestItem, 'address', $event)"
                  />
                </div>

                <div class="verification-section__status-line">
                  <span class="verification-badge" :class="statusClass(detailState(requestItem.user_id).verification.address.verification_status)">
                    {{ statusText(detailState(requestItem.user_id).verification.address.verification_status) }}
                  </span>
                  <span class="verification-section__status-line-text">Address data linked to the client profile.</span>
                </div>

                <div
                  v-if="detailState(requestItem.user_id).verification.address.comment"
                  class="verification-section__note"
                >
                  {{ detailState(requestItem.user_id).verification.address.comment }}
                </div>
              </section>
            </div>

            <div class="verification-review-card__verification-grid">
              <section
                v-for="section in verificationStatusCards(requestItem)"
                :key="section.key"
                class="verification-section verification-section--compact"
              >
                <div class="verification-section__header">
                  <div class="verification-section__title-wrap">
                    <component :is="section.icon" />
                    <span>{{ section.label }}</span>
                  </div>
                  <VerificationActions
                    :status="section.status"
                    :disabled="section.readonly || isUpdating(requestItem.id)"
                    @update-status="handleVerificationStepUpdate(requestItem, section.key, $event)"
                  />
                </div>

                <div class="verification-section__status-line">
                  <span class="verification-badge" :class="statusClass(section.status)">
                    {{ statusText(section.status) }}
                  </span>
                </div>

                <div
                  v-if="section.comment"
                  class="verification-section__note"
                >
                  {{ section.comment }}
                </div>
              </section>
            </div>

            <section class="verification-section verification-section--documents">
              <div class="verification-section__header">
                <div class="verification-section__title-wrap">
                  <UiIconDocuments />
                  <span>Documents verification</span>
                </div>
                <VerificationActions
                  :status="detailState(requestItem.user_id).verification.documents.verification_status"
                  :disabled="isUpdating(requestItem.id)"
                  @update-status="handleVerificationStepUpdate(requestItem, 'documents', $event)"
                />
              </div>

              <div
                v-if="detailState(requestItem.user_id).documents.length === 0"
                class="verification-section__empty"
              >
                No uploaded documents.
              </div>

              <div
                v-else
                class="verification-documents-grid"
              >
                <article
                  v-for="document in detailState(requestItem.user_id).documents"
                  :key="document.id"
                  class="verification-document-card"
                >
                  <button
                    type="button"
                    class="verification-document-card__preview"
                    @click.stop="openVerificationDocument(document)"
                  >
                    <img
                      v-if="document.document_data.full_url"
                      :src="document.document_data.full_url"
                      :alt="document.name || document.document_data.number || 'Document preview'"
                    />
                    <span v-else>DOC</span>
                  </button>

                  <div class="verification-document-card__content">
                    <div class="verification-document-card__title">{{ document.name || document.document_data.number || "Document" }}</div>
                    <div class="verification-document-card__meta">
                      <span>#{{ document.document_data.number || document.id }}</span>
                      <span>{{ formatDateTime(document.updated_at) }}</span>
                    </div>
                    <div
                      v-if="document.comment"
                      class="verification-document-card__comment"
                    >
                      {{ document.comment }}
                    </div>
                  </div>

                  <div class="verification-document-card__actions">
                    <VerificationActions
                      :status="document.state"
                      :disabled="isUpdating(requestItem.id)"
                      @update-status="handleSingleDocumentUpdate(requestItem, document.id, $event)"
                    />
                  </div>
                </article>
              </div>
            </section>

            <section class="verification-section verification-section--accounts">
              <div class="verification-section__header">
                <div class="verification-section__title-wrap">
                  <UiIconCardCheck />
                  <span>Client accounts</span>
                </div>
                <span class="verification-section__count">{{ detailState(requestItem.user_id).accounts.length }}</span>
              </div>

              <div
                v-if="detailState(requestItem.user_id).accounts.length === 0"
                class="verification-section__empty"
              >
                No trading accounts found.
              </div>

              <div
                v-else
                class="verification-accounts-grid"
              >
                <div
                  v-for="account in detailState(requestItem.user_id).accounts"
                  :key="account.id"
                  class="verification-account-card"
                >
                  <div class="verification-account-card__row">
                    <span class="verification-account-card__number">{{ account.number || "-" }}</span>
                    <span class="verification-badge verification-badge--muted">{{ formatMoney(account.balance, account.currency || 'USD') }}</span>
                  </div>
                  <div class="verification-account-card__meta">
                    <span>{{ account.type_name || "-" }}</span>
                    <span>·</span>
                    <span>{{ account.leverage_display || "-" }}</span>
                    <span v-if="account.payment_type">· {{ account.payment_type }}</span>
                  </div>
                </div>
              </div>
            </section>

            <section class="verification-section verification-section--payouts">
              <div class="verification-section__header">
                <div class="verification-section__title-wrap">
                  <UiIconPaymentDetail />
                  <span>Payout requisites</span>
                </div>
                <span class="verification-section__count">{{ detailState(requestItem.user_id).paymentDetails.length }}</span>
              </div>

              <div
                v-if="detailState(requestItem.user_id).paymentDetails.length === 0"
                class="verification-section__empty"
              >
                No payout requisites attached.
              </div>

              <div
                v-else
                class="verification-payout-grid"
              >
                <article
                  v-for="paymentDetail in detailState(requestItem.user_id).paymentDetails"
                  :key="paymentDetail.id"
                  class="verification-payout-card"
                >
                  <div class="verification-payout-card__header">
                    <div>
                      <div class="verification-payout-card__title">{{ paymentDetail.name || "Payout detail" }}</div>
                      <div class="verification-payout-card__subtitle">
                        {{ paymentDetail.payment_system_name || "-" }}
                        <span v-if="paymentDetail.updated_at">· {{ formatDateTime(paymentDetail.updated_at) }}</span>
                      </div>
                    </div>
                    <VerificationActions
                      :status="paymentDetail.status"
                      :disabled="isUpdating(requestItem.id)"
                      @update-status="handlePaymentDetailUpdate(requestItem, paymentDetail.id, $event)"
                    />
                  </div>

                  <div
                    v-if="paymentDetailEntries(paymentDetail).length"
                    class="verification-data-grid verification-data-grid--compact"
                  >
                    <div
                      v-for="entry in paymentDetailEntries(paymentDetail)"
                      :key="`${paymentDetail.id}:${entry.key}`"
                      class="verification-data-grid__item"
                    >
                      <span class="verification-data-grid__key">{{ entry.label }}</span>
                      <span class="verification-data-grid__value">{{ entry.value }}</span>
                    </div>
                  </div>

                  <div
                    v-if="paymentDetail.admin_comment"
                    class="verification-section__note"
                  >
                    {{ paymentDetail.admin_comment }}
                  </div>

                  <div
                    v-if="paymentDetail.documents.length"
                    class="verification-payout-card__documents"
                  >
                    <button
                      v-for="(document, documentIndex) in paymentDetail.documents"
                      :key="`${paymentDetail.id}:${document.path}:${documentIndex}`"
                      type="button"
                      class="verification-payout-card__document"
                      @click.stop="openPaymentDetailDocument(paymentDetail, document)"
                    >
                      <img
                        v-if="resolvePaymentDocumentPreview(document)"
                        :src="resolvePaymentDocumentPreview(document)"
                        :alt="document.name || `Document ${documentIndex + 1}`"
                      />
                      <span v-else>DOC</span>
                    </button>
                  </div>
                </article>
              </div>
            </section>

            <section class="verification-section verification-section--history">
              <div class="verification-section__header">
                <div class="verification-section__title-wrap">
                  <UiIconClock />
                  <span>Verification history</span>
                </div>
              </div>

              <div
                v-if="detailState(requestItem.user_id).verification.history.length === 0"
                class="verification-section__empty"
              >
                No verification history yet.
              </div>

              <div
                v-else
                class="verification-history"
              >
                <div
                  v-for="historyRow in detailState(requestItem.user_id).verification.history"
                  :key="historyRow.id"
                  class="verification-history__item"
                >
                  <span class="verification-badge" :class="statusClass(historyRow.status)">{{ historyRow.name }}</span>
                  <span class="verification-history__time">{{ historyRow.date }}</span>
                </div>
              </div>
            </section>
          </template>
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
import { computed, onMounted, reactive, ref, watch } from "vue";
import { navigateTo } from "nuxt/app";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowRightShort from "~/components/ui/UiIconArrowRightShort.vue";
import UiIconCardCheck from "~/components/ui/UiIconCardCheck.vue";
import UiIconClock from "~/components/ui/UiIconClock.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconInfo from "~/components/ui/UiIconInfo.vue";
import UiIconImage from "~/components/ui/UiIconImage.vue";
import UiIconLetter from "~/components/ui/UiIconLetter.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";

type RequestReviewState = "pending" | "viewed" | "approved" | "rejected";
type VerificationStepKey = "info" | "address" | "email" | "photo" | "documents" | "deposit";
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

interface VerificationHistoryRow {
  id: string;
  name: string;
  date: string;
  status: VerificationStatus;
}

interface VerificationPayloadData {
  info: VerificationSectionData;
  address: VerificationSectionData;
  email: VerificationSectionData;
  photo: VerificationSectionData;
  documents: VerificationSectionData;
  deposit: VerificationSectionData;
  history: VerificationHistoryRow[];
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
  created_at: string;
  updated_at: string;
  document_data: {
    number: string;
    full_url: string;
  };
}

interface AccountRow {
  id: string;
  number: string;
  balance: number;
  currency: string;
  payment_type: string;
  type_name: string;
  leverage_display: string;
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
  data: Record<string, unknown>;
  documents: PaymentDetailDocument[];
}

interface DetailState {
  isLoading: boolean;
  loaded: boolean;
  error: string;
  user: ClientPayload | null;
  verification: VerificationPayloadData;
  documents: VerificationDocumentRow[];
  accounts: AccountRow[];
  paymentDetails: PaymentDetailRow[];
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

let searchTimer: number | undefined;

const createDefaultVerificationSection = (): VerificationSectionData => ({
  verification_status: "pending",
  comment: "",
});

const createDefaultVerificationPayload = (): VerificationPayloadData => ({
  info: createDefaultVerificationSection(),
  address: createDefaultVerificationSection(),
  email: createDefaultVerificationSection(),
  photo: createDefaultVerificationSection(),
  documents: createDefaultVerificationSection(),
  deposit: createDefaultVerificationSection(),
  history: [],
});

const createEmptyDetailState = (): DetailState => ({
  isLoading: false,
  loaded: false,
  error: "",
  user: null,
  verification: createDefaultVerificationPayload(),
  documents: [],
  accounts: [],
  paymentDetails: [],
});

const sortOptions = [
  { id: "updated_desc", value: "updated_desc", text: "Newest activity first" },
  { id: "updated_asc", value: "updated_asc", text: "Oldest activity first" },
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

const fullClientName = (user: ClientPayload | null): string => {
  if (!user) {
    return "-";
  }

  const parts = [user.first_name, user.last_name, user.mid_name].map(value => String(value || "").trim()).filter(Boolean);
  return parts.length ? parts.join(" ") : "-";
};

const formatAddress = (user: ClientPayload | null): string => {
  if (!user) {
    return "-";
  }

  const parts = [user.country, user.state, user.city, user.address, user.postal_code]
    .map(value => String(value || "").trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : "-";
};

const shortId = (value: string): string => String(value || "").replace(/-/g, "").slice(0, 10).toUpperCase();

const formatCount = (value: number): string => new Intl.NumberFormat("en-US").format(Number(value || 0));

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

const formatDateTime = (value: string | null): string => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

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
      return "Requires attention";
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

const normalizeVerificationPayload = (payload: any): VerificationPayloadData => {
  const normalized = createDefaultVerificationPayload();

  (["info", "address", "email", "photo", "documents", "deposit"] as VerificationStepKey[]).forEach(step => {
    normalized[step] = {
      verification_status: normalizeVerificationStatus(payload?.[step]?.verification_status),
      comment: String(payload?.[step]?.comment ?? ""),
    };
  });

  normalized.history = Array.isArray(payload?.history)
    ? payload.history.map((row: any) => ({
        id: String(row?.id ?? Math.random()),
        name: String(row?.name ?? ""),
        date: String(row?.date ?? ""),
        status: normalizeVerificationStatus(row?.status),
      }))
    : [];

  return normalized;
};

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
        created_at: String(row?.created_at ?? ""),
        updated_at: String(row?.updated_at ?? ""),
        document_data: {
          number: String(row?.document_data?.number ?? ""),
          full_url: String(row?.document_data?.full_url ?? ""),
        },
      }))
    : [];

const normalizeAccounts = (payload: any): AccountRow[] =>
  Array.isArray(payload)
    ? payload.map((row: any) => ({
        id: String(row?.id ?? ""),
        number: String(row?.number ?? ""),
        balance: Number(row?.balance ?? 0),
        currency: String(row?.currency ?? "USD"),
        payment_type: String(row?.payment_type ?? ""),
        type_name: String(row?.type_name ?? ""),
        leverage_display: String(row?.leverage_display ?? ""),
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
        data: row?.data && typeof row.data === "object" ? row.data : {},
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

const paymentDetailEntries = (paymentDetail: PaymentDetailRow): Array<{ key: string; label: string; value: string }> =>
  Object.entries(paymentDetail.data || {})
    .map(([key, rawValue]) => ({
      key,
      label: normalizePaymentLabel(key),
      value: formatPaymentValue(rawValue),
    }))
    .filter(entry => entry.value !== "");

const normalizePaymentLabel = (value: string): string =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();

const formatPaymentValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(item => formatPaymentValue(item)).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(item => formatPaymentValue(item)).filter(Boolean).join(", ");
  }

  return String(value ?? "").trim();
};

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

    await Promise.all(requestItems.value.map(item => loadRequestDetailBundle(item)));
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

  const [clientResult, verificationResult, documentsResult, accountsResult, paymentDetailsResult] = await Promise.allSettled([
    appCore.adminModules.clients.getById(requestItem.user_id),
    appCore.adminModules.verificationRequests.get(requestItem.user_id),
    appCore.adminModules.documents.get({ clientId: requestItem.user_id }),
    appCore.adminModules.accounts.get({
      page: 1,
      perPage: 50,
      orderBy: "created_at",
      orderDirection: "desc",
      ["filters[user_id]"]: requestItem.user_id,
    }),
    appCore.adminModules.clients.getPaymentDetails(requestItem.user_id),
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

    if (accountsResult.status === "fulfilled") {
      state.accounts = normalizeAccounts(accountsResult.value?.data?.data?.data ?? []);
    }

    if (paymentDetailsResult.status === "fulfilled") {
      state.paymentDetails = normalizePaymentDetails(paymentDetailsResult.value?.data?.data ?? []);
    }

    const firstRejected = [clientResult, verificationResult, documentsResult, accountsResult, paymentDetailsResult]
      .find(result => result.status === "rejected") as PromiseRejectedResult | undefined;

    if (firstRejected) {
      state.error = String((firstRejected.reason as any)?.response?.data?.message ?? "Some verification sections failed to load.");
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
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(async () => {
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

const handleRequestReviewUpdate = async (requestItem: VerificationRequestItem, nextState: RequestReviewState): Promise<void> => {
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

const handleVerificationStepUpdate = async (
  requestItem: VerificationRequestItem,
  type: VerificationStepKey,
  payload: { status: VerificationStatus; comment?: string }
): Promise<void> => {
  updatingState[requestItem.id] = true;

  try {
    await appCore.adminModules.verificationRequests.put(requestItem.user_id, {
      type,
      updatedStatus: {
        status: payload.status,
        comment: payload.comment || "",
      },
    });

    toast.success("Verification section updated.");
    await Promise.all([loadList(), loadRequestDetailBundle(requestItem, true)]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update verification section.");
  } finally {
    delete updatingState[requestItem.id];
  }
};

const handleSingleDocumentUpdate = async (
  requestItem: VerificationRequestItem,
  documentId: string,
  payload: { status: VerificationStatus; comment?: string }
): Promise<void> => {
  updatingState[requestItem.id] = true;

  try {
    await appCore.adminModules.verificationRequests.put(requestItem.user_id, {
      type: "document",
      docId: documentId,
      updatedStatus: {
        status: payload.status,
        comment: payload.comment || "",
      },
    });

    toast.success("Document status updated.");
    await Promise.all([loadList(), loadRequestDetailBundle(requestItem, true)]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update document status.");
  } finally {
    delete updatingState[requestItem.id];
  }
};

const handlePaymentDetailUpdate = async (
  requestItem: VerificationRequestItem,
  paymentDetailId: string,
  payload: { status: VerificationStatus; comment?: string }
): Promise<void> => {
  updatingState[requestItem.id] = true;

  try {
    await appCore.adminModules.clients.patchPaymentDetailStatus(requestItem.user_id, paymentDetailId, {
      status: payload.status,
      comment: payload.comment || "",
    });

    toast.success("Payout requisite updated.");
    await loadRequestDetailBundle(requestItem, true);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update payout requisite.");
  } finally {
    delete updatingState[requestItem.id];
  }
};

const openClientVerification = (userId: string): void => {
  navigateTo(localePath(`/clients/${userId}?tab=1&verificationTab=client`));
};

const openVerificationDocument = (document: VerificationDocumentRow): void => {
  if (!document.document_data.full_url) {
    toast.error("Document preview is unavailable.");
    return;
  }

  window.open(document.document_data.full_url, "_blank", "noopener,noreferrer");
};

const resolvePaymentDocumentPreview = (document: PaymentDetailDocument): string =>
  String(document.preview_url || document.previewUrl || "").trim();

const openPaymentDetailDocument = async (paymentDetail: PaymentDetailRow, document: PaymentDetailDocument): Promise<void> => {
  const preview = resolvePaymentDocumentPreview(document);
  if (preview) {
    window.open(preview, "_blank", "noopener,noreferrer");
    return;
  }

  if (!document.path) {
    toast.error("Document path is missing.");
    return;
  }

  try {
    const response = await appCore.s3.getTempViewUrl({ path: document.path });
    const signedUrl = response?.data?.url || response?.data?.data?.url || "";

    if (!signedUrl) {
      toast.error("Unable to open payout document.");
      return;
    }

    window.open(signedUrl, "_blank", "noopener,noreferrer");
  } catch {
    toast.error("Unable to open payout document.");
  }
};

const verificationStatusCards = (requestItem: VerificationRequestItem): Array<{
  key: VerificationStepKey;
  label: string;
  status: VerificationStatus;
  comment: string;
  readonly: boolean;
  icon: any;
}> => {
  const state = detailState(requestItem.user_id).verification;

  return [
    {
      key: "email",
      label: "Email verification",
      status: state.email.verification_status,
      comment: state.email.comment,
      readonly: false,
      icon: UiIconLetter,
    },
    {
      key: "photo",
      label: "Profile photo",
      status: state.photo.verification_status,
      comment: state.photo.comment,
      readonly: false,
      icon: UiIconImage,
    },
    {
      key: "deposit",
      label: "First deposit",
      status: state.deposit.verification_status,
      comment: state.deposit.comment,
      readonly: false,
      icon: UiIconPaymentDetail,
    },
  ];
};

onMounted(loadList);

defineExpose({
  reload: handleRefreshAll,
});
</script>

<style lang="scss" scoped>
.verification-review-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.verification-review-page__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 12px;
}

.verification-stat-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid rgba(73, 108, 222, 0.22);
  background:
    linear-gradient(180deg, rgba(11, 23, 82, 0.92), rgba(8, 18, 66, 0.96));
  color: var(--ui-text-main);
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.verification-stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(73, 108, 222, 0.38);
}

.verification-stat-card.is-active {
  border-color: rgba(73, 108, 222, 0.75);
  box-shadow: 0 0 0 1px rgba(73, 108, 222, 0.35);
}

.verification-stat-card__label {
  font-size: 0.82rem;
  color: var(--ui-text-secondary);
}

.verification-stat-card__value {
  font-size: 1.85rem;
  line-height: 1;
  font-weight: 700;
}

.verification-review-page__toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.verification-review-page__search {
  flex: 1 1 auto;
}

.verification-review-page__toolbar-controls {
  display: flex;
  gap: 12px;
  flex: 0 0 auto;
}

.verification-review-page__sort {
  min-width: 240px;
}

.verification-review-page__active-filter,
.verification-review-page__error,
.verification-review-page__empty,
.verification-review-page__loading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--color-stroke-ui-light);
  background: rgba(7, 17, 66, 0.6);
  color: var(--ui-text-main);
}

.verification-review-page__active-filter button,
.verification-review-card__detail-error button {
  color: var(--ui-primary-main);
}

.verification-review-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.verification-review-card {
  border-radius: 22px;
  border: 1px solid rgba(74, 108, 222, 0.2);
  background:
    radial-gradient(circle at top right, rgba(41, 75, 196, 0.18), transparent 28%),
    linear-gradient(180deg, rgba(7, 18, 71, 0.98), rgba(5, 14, 57, 0.98));
  overflow: hidden;
}

.verification-review-card__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 22px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.verification-review-card__identity {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.verification-review-card__identity-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.verification-review-card__identity-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-review-card__identity-subtitle,
.verification-review-card__identity-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.86rem;
  color: var(--ui-text-secondary);
}

.verification-review-card__hero-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.verification-review-card__request-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.verification-request-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ui-text-main);
  font-size: 0.85rem;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.verification-request-action svg {
  height: 14px;
  width: 14px;
}

.verification-request-action:hover,
.verification-request-action.is-active {
  border-color: rgba(73, 108, 222, 0.45);
}

.verification-request-action--viewed.is-active {
  background: rgba(233, 174, 0, 0.16);
}

.verification-request-action--approved.is-active {
  background: rgba(22, 163, 74, 0.18);
}

.verification-request-action--rejected.is-active {
  background: rgba(220, 38, 38, 0.18);
}

.verification-review-card__open-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ui-primary-main);
  font-size: 0.9rem;
  font-weight: 600;
}

.verification-review-card__open-btn svg {
  width: 16px;
  height: 16px;
}

.verification-review-card__body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 22px 22px;
}

.verification-review-card__detail-loading,
.verification-review-card__detail-error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(4, 12, 46, 0.5);
  color: var(--ui-text-secondary);
}

.verification-review-card__detail-error {
  flex-direction: column;
  gap: 12px;
}

.verification-review-card__top-grid,
.verification-review-card__verification-grid {
  display: grid;
  gap: 14px;
}

.verification-review-card__top-grid {
  grid-template-columns: minmax(320px, 1.3fr) minmax(260px, 0.9fr);
}

.verification-review-card__verification-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.025);
}

.verification-section__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-section__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--ui-text-main);
  font-weight: 700;
}

.verification-section__title-wrap :deep(svg) {
  width: 16px;
  height: 16px;
}

.verification-section__count {
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(73, 108, 222, 0.15);
  color: var(--ui-text-main);
  font-size: 0.8rem;
}

.verification-section__status-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.verification-section__status-line-text,
.verification-document-card__meta,
.verification-account-card__meta,
.verification-payout-card__subtitle,
.verification-history__time {
  color: var(--ui-text-secondary);
  font-size: 0.85rem;
}

.verification-section__note {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  color: var(--ui-text-main);
  font-size: 0.92rem;
  line-height: 1.5;
}

.verification-section__empty {
  padding: 16px;
  border-radius: 14px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  color: var(--ui-text-secondary);
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid transparent;
  white-space: nowrap;
}

.verification-badge.is-approved {
  background: rgba(22, 163, 74, 0.16);
  color: #86efac;
}

.verification-badge.is-rejected {
  background: rgba(220, 38, 38, 0.16);
  color: #fca5a5;
}

.verification-badge.is-pending,
.verification-badge.is-viewed {
  background: rgba(233, 174, 0, 0.16);
  color: #fcd34d;
}

.verification-badge--muted {
  background: rgba(255, 255, 255, 0.05);
  color: var(--ui-text-secondary);
}

.verification-badge--overall {
  border-color: rgba(255, 255, 255, 0.08);
}

.verification-data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.verification-data-grid--compact {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.verification-data-grid__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

.verification-data-grid__item--wide {
  grid-column: 1 / -1;
}

.verification-data-grid__key {
  color: var(--ui-text-secondary);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.verification-data-grid__value {
  color: var(--ui-text-main);
  font-size: 0.94rem;
  line-height: 1.45;
  word-break: break-word;
}

.verification-documents-grid,
.verification-payout-grid {
  display: grid;
  gap: 14px;
}

.verification-documents-grid {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.verification-document-card,
.verification-payout-card,
.verification-account-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-document-card {
  flex-direction: row;
  align-items: stretch;
}

.verification-document-card__preview {
  flex: 0 0 108px;
  height: 108px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-text-secondary);
}

.verification-document-card__preview img,
.verification-payout-card__document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-document-card__content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.verification-document-card__title,
.verification-payout-card__title,
.verification-account-card__number {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-document-card__comment {
  color: var(--ui-text-main);
  font-size: 0.9rem;
}

.verification-document-card__actions {
  flex: 0 0 auto;
  display: flex;
  align-items: flex-start;
}

.verification-accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.verification-account-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.verification-payout-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-payout-card__documents {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.verification-payout-card__document {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  color: var(--ui-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.verification-history {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.verification-history__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
}

@media (max-width: 1200px) {
  .verification-review-card__top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .verification-review-page__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .verification-review-page__toolbar-controls {
    width: 100%;
  }

  .verification-review-page__sort {
    flex: 1 1 auto;
    min-width: 0;
  }

  .verification-review-card__hero {
    flex-direction: column;
  }

  .verification-review-card__hero-side {
    width: 100%;
    align-items: stretch;
  }

  .verification-review-card__request-actions {
    justify-content: flex-start;
  }

  .verification-data-grid {
    grid-template-columns: 1fr;
  }

  .verification-document-card {
    flex-direction: column;
  }

  .verification-document-card__preview {
    width: 100%;
    flex-basis: auto;
  }
}
</style>
