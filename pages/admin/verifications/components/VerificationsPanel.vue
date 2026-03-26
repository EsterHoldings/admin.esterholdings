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

        <UiButtonDefault state="info--small" class="!w-[42px]" @click="handleRefreshAll">
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
      class="verification-request-grid"
    >
      <button
        v-for="requestItem in requestItems"
        :key="requestItem.id"
        type="button"
        class="verification-request-tile"
        :class="{ 'is-source-hidden': isModalOpen && activeRequestId === requestItem.id }"
        :style="cardTransitionStyle(requestItem.id)"
        @click="openRequestModal(requestItem)"
      >
        <div class="verification-request-tile__head">
          <div class="verification-request-tile__identity">
            <UiImageCircle
              :src="requestItem.user.photo_url || ''"
              :two-chars="displayClientInitials(requestItem)"
            />

            <div class="verification-request-tile__identity-meta">
              <div class="verification-request-tile__name">
                {{ displayClientName(requestItem) }}
              </div>
              <div class="verification-request-tile__subtitle">
                <span>{{ requestItem.user.email || "-" }}</span>
                <span>· #{{ shortId(requestItem.id) }}</span>
              </div>
            </div>
          </div>

          <div class="verification-request-tile__badges">
            <span
              class="verification-badge verification-badge--request"
              :class="requestStateClass(requestItem.request_state)"
            >
              {{ requestStateText(requestItem.request_state) }}
            </span>
            <span
              class="verification-badge verification-badge--overall"
              :class="statusClass(requestItem.state)"
            >
              {{ overallStatusText(requestItem.state) }}
            </span>
          </div>
        </div>

        <div class="verification-request-tile__facts">
          <div class="verification-mini-fact">
            <span class="verification-mini-fact__label">Profile</span>
            <span
              class="verification-mini-fact__value verification-mini-fact__value--status"
              :class="statusClass(detailState(requestItem.user_id).verification.info.verification_status)"
            >
              {{ statusText(detailState(requestItem.user_id).verification.info.verification_status) }}
            </span>
          </div>

          <div class="verification-mini-fact">
            <span class="verification-mini-fact__label">Documents</span>
            <span class="verification-mini-fact__value">
              {{ documentsSummary(detailState(requestItem.user_id)) }}
            </span>
          </div>

          <div class="verification-mini-fact">
            <span class="verification-mini-fact__label">Requisites</span>
            <span class="verification-mini-fact__value">
              {{ requisitesSummary(detailState(requestItem.user_id)) }}
            </span>
          </div>

          <div class="verification-mini-fact">
            <span class="verification-mini-fact__label">First payment</span>
            <span
              class="verification-mini-fact__value verification-mini-fact__value--status"
              :class="detailState(requestItem.user_id).firstDeposit ? 'is-approved' : 'is-pending'"
            >
              {{ firstPaymentSummary(detailState(requestItem.user_id)) }}
            </span>
          </div>
        </div>

        <div class="verification-request-tile__footer">
          <span>Updated {{ requestItem.updated_at_human || "-" }}</span>
          <span class="verification-request-tile__open">
            Review
            <UiIconArrowRightShort />
          </span>
        </div>
      </button>
    </div>

    <PaginationDefault
      :isLoading="isLoading"
      :perPage="perPage"
      :page="page"
      :totalRows="totalRows"
      @perPageChange="handleChangePerPage"
      @pageChange="handleChangePage"
    />

    <Teleport to="body">
      <Transition name="verification-modal-fade">
        <div
          v-if="isModalOpen && activeRequestItem"
          class="verification-modal-layer"
          @click="closeRequestModal"
        >
          <div class="verification-modal-shell">
            <article
              class="verification-modal"
              :style="modalTransitionStyle"
              @click.stop
            >
              <header class="verification-modal__header">
                <div class="verification-modal__identity">
                  <UiImageCircle
                    :src="activeRequestItem.user.photo_url || ''"
                    :two-chars="displayClientInitials(activeRequestItem)"
                  />

                  <div class="verification-modal__identity-meta">
                    <div class="verification-modal__title">
                      {{ displayClientName(activeRequestItem) }}
                    </div>
                    <div class="verification-modal__subtitle">
                      <span>{{ activeRequestItem.user.email || "-" }}</span>
                      <span>· #{{ shortId(activeRequestItem.id) }}</span>
                      <span>· Updated {{ activeRequestItem.updated_at_human || "-" }}</span>
                    </div>
                    <div class="verification-modal__badges">
                      <span
                        class="verification-badge verification-badge--request"
                        :class="requestStateClass(activeRequestItem.request_state)"
                      >
                        {{ requestStateText(activeRequestItem.request_state) }}
                      </span>
                      <span
                        class="verification-badge verification-badge--overall"
                        :class="statusClass(activeRequestItem.state)"
                      >
                        {{ overallStatusText(activeRequestItem.state) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="verification-modal__header-actions">
                  <div class="verification-request-actions">
                    <button
                      type="button"
                      class="verification-request-action verification-request-action--viewed"
                      :class="{ 'is-active': activeRequestItem.request_state === 'viewed' }"
                      @click="handleRequestReviewUpdate(activeRequestItem, 'viewed')"
                    >
                      <UiIconEye />
                      <span>Viewed</span>
                    </button>
                    <button
                      type="button"
                      class="verification-request-action verification-request-action--approved"
                      :class="{ 'is-active': activeRequestItem.request_state === 'approved' }"
                      @click="handleRequestReviewUpdate(activeRequestItem, 'approved')"
                    >
                      <UiIconSuccess />
                      <span>Confirm request</span>
                    </button>
                    <button
                      type="button"
                      class="verification-request-action verification-request-action--rejected"
                      :class="{ 'is-active': activeRequestItem.request_state === 'rejected' }"
                      @click="handleRequestReviewUpdate(activeRequestItem, 'rejected')"
                    >
                      <UiIconFailed />
                      <span>Cancel request</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    class="verification-modal__close"
                    @click="closeRequestModal"
                  >
                    <span>Close</span>
                    <span aria-hidden="true">x</span>
                  </button>
                </div>
              </header>

              <div class="verification-modal__body">
                <div
                  v-if="activeDetailState?.isLoading"
                  class="verification-modal__state"
                >
                  <UiIconSpinnerDefault />
                </div>

                <div
                  v-else-if="activeDetailState?.error"
                  class="verification-modal__state verification-modal__state--error"
                >
                  <span>{{ activeDetailState.error }}</span>
                  <button type="button" @click="loadRequestDetailBundle(activeRequestItem, true)">Retry</button>
                </div>

                <template v-else-if="activeDetailState">
                  <div class="verification-modal__top-grid">
                    <section class="verification-section">
                      <div class="verification-section__header">
                        <div class="verification-section__title-wrap">
                          <UiIconProfile />
                          <span>Profile</span>
                        </div>
                        <VerificationActions
                          :status="activeDetailState.verification.info.verification_status"
                          :disabled="isUpdating(activeRequestItem.id)"
                          @update-status="handleVerificationStepUpdate(activeRequestItem, 'info', $event)"
                        />
                      </div>

                      <div class="verification-data-grid">
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Full name</span>
                          <span class="verification-data-grid__value">{{ fullClientName(activeDetailState.user) }}</span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Birthdate</span>
                          <span class="verification-data-grid__value">{{ activeDetailState.user?.birthdate || "-" }}</span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Phone</span>
                          <span class="verification-data-grid__value">{{ activeDetailState.user?.phone || "-" }}</span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Email</span>
                          <span class="verification-data-grid__value">{{ activeDetailState.user?.email || "-" }}</span>
                        </div>
                        <div class="verification-data-grid__item verification-data-grid__item--wide">
                          <span class="verification-data-grid__key">Address</span>
                          <span class="verification-data-grid__value">{{ formatAddress(activeDetailState.user) }}</span>
                        </div>
                      </div>

                      <div
                        v-if="activeDetailState.verification.info.comment"
                        class="verification-section__note"
                      >
                        {{ activeDetailState.verification.info.comment }}
                      </div>
                    </section>

                    <section class="verification-section">
                      <div class="verification-section__header">
                        <div class="verification-section__title-wrap">
                          <UiIconPaymentDetail />
                          <span>First payment</span>
                        </div>
                        <span
                          class="verification-badge"
                          :class="activeDetailState.firstDeposit ? 'is-approved' : 'is-pending'"
                        >
                          {{ activeDetailState.firstDeposit ? "Recorded" : "No deposit" }}
                        </span>
                      </div>

                      <div
                        v-if="activeDetailState.firstDeposit"
                        class="verification-data-grid"
                      >
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Amount</span>
                          <span class="verification-data-grid__value">
                            {{ formatMoney(activeDetailState.firstDeposit.amount, activeDetailState.firstDeposit.currency || "USD") }}
                          </span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Method</span>
                          <span class="verification-data-grid__value">{{ paymentMethodName(activeDetailState.firstDeposit) }}</span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Status</span>
                          <span class="verification-data-grid__value">{{ paymentStatusText(activeDetailState.firstDeposit.status) }}</span>
                        </div>
                        <div class="verification-data-grid__item">
                          <span class="verification-data-grid__key">Created at</span>
                          <span class="verification-data-grid__value">{{ formatDateTime(activeDetailState.firstDeposit.created_at) }}</span>
                        </div>
                      </div>

                      <div
                        v-else
                        class="verification-section__empty"
                      >
                        The client has no deposit transactions yet.
                      </div>
                    </section>
                  </div>

                  <section class="verification-section">
                    <div class="verification-section__header">
                      <div class="verification-section__title-wrap">
                        <UiIconDocuments />
                        <span>Documents</span>
                      </div>
                      <VerificationActions
                        :status="activeDetailState.verification.documents.verification_status"
                        :disabled="isUpdating(activeRequestItem.id)"
                        @update-status="handleVerificationStepUpdate(activeRequestItem, 'documents', $event)"
                      />
                    </div>

                    <div
                      v-if="activeDetailState.documents.length === 0"
                      class="verification-section__empty"
                    >
                      No uploaded documents.
                    </div>

                    <div
                      v-else
                      class="verification-documents-grid"
                    >
                      <article
                        v-for="document in activeDetailState.documents"
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
                          <div class="verification-document-card__title">
                            {{ document.name || document.document_data.number || "Document" }}
                          </div>
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

                        <VerificationActions
                          :status="document.state"
                          :disabled="isUpdating(activeRequestItem.id)"
                          @update-status="handleSingleDocumentUpdate(activeRequestItem, document.id, $event)"
                        />
                      </article>
                    </div>
                  </section>

                  <section class="verification-section">
                    <div class="verification-section__header">
                      <div class="verification-section__title-wrap">
                        <UiIconPaymentDetail />
                        <span>Requisites</span>
                      </div>
                      <span class="verification-section__count">
                        {{ activeDetailState.paymentDetails.length }}
                      </span>
                    </div>

                    <div
                      v-if="activeDetailState.paymentDetails.length === 0"
                      class="verification-section__empty"
                    >
                      No payout requisites attached.
                    </div>

                    <div
                      v-else
                      class="verification-payout-grid"
                    >
                      <article
                        v-for="paymentDetail in activeDetailState.paymentDetails"
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
                            :disabled="isUpdating(activeRequestItem.id)"
                            @update-status="handlePaymentDetailUpdate(activeRequestItem, paymentDetail.id, $event)"
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
                </template>
              </div>

              <footer class="verification-modal__footer">
                <button
                  type="button"
                  class="verification-modal__link"
                  @click="openClientVerification(activeRequestItem.user_id)"
                >
                  Open client verification
                  <UiIconArrowRightShort />
                </button>
              </footer>
            </article>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { navigateTo } from "nuxt/app";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
import PaginationDefault from "~/components/block/paginations/PaginationDefault.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconArrowRightShort from "~/components/ui/UiIconArrowRightShort.vue";
import UiIconDocuments from "~/components/ui/UiIconDocuments.vue";
import UiIconEye from "~/components/ui/UiIconEye.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";
import UiIconPaymentDetail from "~/components/ui/UiIconPaymentDetail.vue";
import UiIconProfile from "~/components/ui/UiIconProfile.vue";
import UiIconSearch from "~/components/ui/UiIconSearch.vue";
import UiIconSortBy from "~/components/ui/UiIconSortBy.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiInput from "~/components/ui/UiInput.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import VerificationActions from "~/pages/admin/clients/[id]/components/VerificationActions.vue";

type RequestReviewState = "pending" | "viewed" | "approved" | "rejected";
type VerificationStatus = "pending" | "approved" | "rejected";
type VerificationStepKey = "info" | "documents";

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
  created_at: string;
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
  data: Record<string, unknown>;
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
const activeRequestId = ref<string | null>(null);
const isModalOpen = ref(false);
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

const activeRequestItem = computed<VerificationRequestItem | null>(() =>
  requestItems.value.find(item => item.id === activeRequestId.value) ?? null
);

const activeDetailState = computed<DetailState | null>(() =>
  activeRequestItem.value ? detailState(activeRequestItem.value.user_id) : null
);

const cardTransitionStyle = (requestId: string): Record<string, string> | undefined =>
  activeRequestId.value === requestId
    ? { viewTransitionName: "verification-request-card-active" }
    : undefined;

const modalTransitionStyle = computed<Record<string, string> | undefined>(() =>
  activeRequestId.value ? { viewTransitionName: "verification-request-card-active" } : undefined
);

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

  const name = displayClientName(requestItem);
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(item => item.charAt(0).toUpperCase()).join("");

  return initials || "AA";
};

const fullClientName = (user: ClientPayload | null): string => {
  if (!user) {
    return "-";
  }

  const parts = [user.first_name, user.last_name, user.mid_name]
    .map(value => String(value || "").trim())
    .filter(Boolean);

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

const paymentStatusText = (status: string): string => {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "success" || normalized === "completed") {
    return "Approved";
  }
  if (normalized === "rejected" || normalized === "failed" || normalized === "cancelled") {
    return "Rejected";
  }

  return "Pending";
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
        created_at: String(row?.created_at ?? ""),
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
    return Object.values(value as Record<string, unknown>)
      .map(item => formatPaymentValue(item))
      .filter(Boolean)
      .join(", ");
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
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = setTimeout(async () => {
    searchFilter.value = value.trim();
    page.value = 1;
    await loadList();
  }, 350);
});

watch(isModalOpen, value => {
  if (typeof document === "undefined") {
    return;
  }

  document.body.style.overflow = value ? "hidden" : "";
});

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && isModalOpen.value) {
    void closeRequestModal();
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

const runWithViewTransition = async (callback: () => void | Promise<void>): Promise<void> => {
  if (typeof document === "undefined") {
    await callback();
    return;
  }

  const startViewTransition = (document as Document & {
    startViewTransition?: (update: () => void | Promise<void>) => { finished?: Promise<void> };
  }).startViewTransition;

  if (typeof startViewTransition !== "function") {
    await callback();
    return;
  }

  const transition = startViewTransition(() => callback());
  if (transition?.finished) {
    try {
      await transition.finished;
    } catch {
      return;
    }
  }
};

const openRequestModal = async (requestItem: VerificationRequestItem): Promise<void> => {
  await runWithViewTransition(async () => {
    activeRequestId.value = requestItem.id;
    isModalOpen.value = true;
    await nextTick();
  });

  void loadRequestDetailBundle(requestItem, true);
};

const closeRequestModal = async (): Promise<void> => {
  if (!activeRequestId.value) {
    return;
  }

  await runWithViewTransition(async () => {
    isModalOpen.value = false;
    await nextTick();
  });

  activeRequestId.value = null;
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
    await Promise.all([loadList(), loadRequestDetailBundle(requestItem, true)]);
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update payout requisite.");
  } finally {
    delete updatingState[requestItem.id];
  }
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

const openPaymentDetailDocument = async (_paymentDetail: PaymentDetailRow, document: PaymentDetailDocument): Promise<void> => {
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

onMounted(() => {
  void loadList();

  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }
});

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
  }

  if (typeof document !== "undefined") {
    document.body.style.overflow = "";
  }
});

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
  grid-template-columns: repeat(auto-fit, minmax(148px, 1fr));
  gap: 10px;
}

.verification-stat-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 82px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(73, 108, 222, 0.18);
  background: linear-gradient(180deg, rgba(10, 21, 74, 0.9), rgba(7, 17, 62, 0.96));
  color: var(--ui-text-main);
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.verification-stat-card:hover {
  transform: translateY(-1px);
  border-color: rgba(73, 108, 222, 0.34);
}

.verification-stat-card.is-active {
  border-color: rgba(73, 108, 222, 0.7);
  box-shadow: 0 0 0 1px rgba(73, 108, 222, 0.24);
}

.verification-stat-card__label {
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-stat-card__value {
  font-size: 1.55rem;
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
  min-width: 220px;
}

.verification-review-page__active-filter,
.verification-review-page__error,
.verification-review-page__empty,
.verification-review-page__loading {
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

.verification-review-page__active-filter button {
  color: var(--ui-primary-main);
}

.verification-request-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(330px, 1fr));
  gap: 14px;
}

.verification-request-tile {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 188px;
  padding: 16px;
  border-radius: 20px;
  border: 1px solid rgba(73, 108, 222, 0.18);
  background:
    radial-gradient(circle at top right, rgba(41, 75, 196, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(9, 20, 73, 0.96), rgba(6, 16, 59, 0.98));
  text-align: left;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.verification-request-tile:hover {
  transform: translateY(-2px);
  border-color: rgba(73, 108, 222, 0.36);
  box-shadow: 0 16px 40px rgba(3, 9, 34, 0.26);
}

.verification-request-tile.is-source-hidden {
  opacity: 0;
  pointer-events: none;
}

.verification-request-tile__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-request-tile__identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.verification-request-tile__identity-meta {
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.verification-request-tile__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-request-tile__subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-request-tile__badges {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.verification-request-tile__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.verification-mini-fact {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-mini-fact__label {
  font-size: 0.74rem;
  color: var(--ui-text-secondary);
}

.verification-mini-fact__value {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ui-text-main);
}

.verification-mini-fact__value--status.is-approved {
  color: var(--ui-sticker-success);
}

.verification-mini-fact__value--status.is-rejected {
  color: var(--ui-sticker-danger);
}

.verification-mini-fact__value--status.is-pending {
  color: #e9ae00;
}

.verification-request-tile__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-request-tile__open {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ui-primary-main);
  font-weight: 600;
}

.verification-request-tile__open svg {
  width: 14px;
  height: 14px;
}

.verification-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  font-size: 0.76rem;
  font-weight: 600;
  color: var(--ui-text-main);
}

.verification-badge.is-approved {
  background: rgba(22, 163, 74, 0.16);
  border-color: rgba(22, 163, 74, 0.28);
}

.verification-badge.is-rejected {
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(220, 38, 38, 0.28);
}

.verification-badge.is-pending {
  background: rgba(233, 174, 0, 0.14);
  border-color: rgba(233, 174, 0, 0.24);
}

.verification-badge.is-viewed {
  background: rgba(73, 108, 222, 0.14);
  border-color: rgba(73, 108, 222, 0.24);
}

.verification-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px;
  background: rgba(3, 7, 27, 0.72);
  backdrop-filter: blur(14px);
}

.verification-modal-shell {
  width: min(1120px, 100%);
  max-height: calc(100vh - 56px);
}

.verification-modal {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 56px);
  border-radius: 24px;
  border: 1px solid rgba(73, 108, 222, 0.22);
  background:
    radial-gradient(circle at top right, rgba(41, 75, 196, 0.16), transparent 28%),
    linear-gradient(180deg, rgba(10, 21, 74, 0.99), rgba(6, 16, 58, 0.99));
  box-shadow: 0 36px 90px rgba(2, 8, 31, 0.42);
  overflow: hidden;
}

.verification-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.verification-modal__identity {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.verification-modal__identity-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.verification-modal__title {
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-modal__subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.82rem;
  color: var(--ui-text-secondary);
}

.verification-modal__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.verification-modal__header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.verification-request-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.verification-request-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-main);
  font-size: 0.82rem;
  font-weight: 600;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.verification-request-action svg {
  width: 14px;
  height: 14px;
}

.verification-request-action:hover,
.verification-request-action.is-active {
  border-color: rgba(73, 108, 222, 0.4);
}

.verification-request-action--viewed.is-active {
  background: rgba(73, 108, 222, 0.16);
}

.verification-request-action--approved.is-active {
  background: rgba(22, 163, 74, 0.18);
}

.verification-request-action--rejected.is-active {
  background: rgba(220, 38, 38, 0.18);
}

.verification-modal__close {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-main);
  font-size: 0.82rem;
  font-weight: 600;
}

.verification-modal__body {
  flex: 1 1 auto;
  overflow: auto;
  padding: 18px 20px;
}

.verification-modal__state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: var(--ui-text-secondary);
}

.verification-modal__state--error {
  flex-direction: column;
  gap: 12px;
}

.verification-modal__state--error button {
  color: var(--ui-primary-main);
}

.verification-modal__top-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 14px;
  margin-bottom: 14px;
}

.verification-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
}

.verification-section + .verification-section {
  margin-top: 14px;
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
  gap: 8px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-section__title-wrap svg {
  width: 14px;
  height: 14px;
}

.verification-section__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(73, 108, 222, 0.12);
  color: var(--ui-text-main);
  font-size: 0.78rem;
  font-weight: 700;
}

.verification-section__empty,
.verification-section__note {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
  color: var(--ui-text-secondary);
}

.verification-data-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.verification-data-grid--compact {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.verification-data-grid__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.04);
}

.verification-data-grid__item--wide {
  grid-column: 1 / -1;
}

.verification-data-grid__key {
  font-size: 0.74rem;
  color: var(--ui-text-secondary);
}

.verification-data-grid__value {
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--ui-text-main);
  word-break: break-word;
}

.verification-documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 12px;
}

.verification-document-card {
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-document-card__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  color: var(--ui-text-main);
  font-weight: 700;
}

.verification-document-card__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-document-card__content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.verification-document-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-document-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--ui-text-secondary);
}

.verification-document-card__comment {
  font-size: 0.8rem;
  color: var(--ui-text-secondary);
}

.verification-payout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
}

.verification-payout-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.verification-payout-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.verification-payout-card__title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--ui-text-main);
}

.verification-payout-card__subtitle {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.76rem;
  color: var(--ui-text-secondary);
}

.verification-payout-card__documents {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.verification-payout-card__document {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  color: var(--ui-text-main);
  font-size: 0.72rem;
  font-weight: 700;
}

.verification-payout-card__document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.verification-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 20px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.verification-modal__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ui-primary-main);
  font-size: 0.9rem;
  font-weight: 600;
}

.verification-modal__link svg {
  width: 16px;
  height: 16px;
}

.verification-modal-fade-enter-active,
.verification-modal-fade-leave-active {
  transition: opacity 0.24s ease;
}

.verification-modal-fade-enter-from,
.verification-modal-fade-leave-to {
  opacity: 0;
}

.verification-review-page :deep(.doc-actions) {
  width: auto;
}

.verification-review-page :deep(.doc-actions__row) {
  gap: 6px;
}

.verification-review-page :deep(.action-group) {
  gap: 3px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.07);
}

.verification-review-page :deep(.action-toggle) {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--ui-text-main);
}

.verification-review-page :deep(.action-toggle svg) {
  width: 13px;
  height: 13px;
}

.verification-review-page :deep(.action-toggle.active) {
  color: var(--ui-text-main);
}

.verification-review-page :deep(.action-toggle.active[title="Відхилено"]) {
  background: rgba(220, 38, 38, 0.18);
}

.verification-review-page :deep(.action-toggle.active[title="В очікуванні"]) {
  background: rgba(233, 174, 0, 0.16);
}

.verification-review-page :deep(.action-toggle.active[title="Підтверджено"]) {
  background: rgba(22, 163, 74, 0.18);
}

.verification-review-page :deep(.action-toggle:not(.active):hover) {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 1100px) {
  .verification-modal__header {
    flex-direction: column;
  }

  .verification-modal__header-actions {
    width: 100%;
    align-items: stretch;
  }

  .verification-request-actions {
    justify-content: flex-start;
  }

  .verification-modal__top-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .verification-review-page__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .verification-review-page__toolbar-controls {
    width: 100%;
  }

  .verification-review-page__sort {
    min-width: 0;
    flex: 1 1 auto;
  }

  .verification-request-grid {
    grid-template-columns: 1fr;
  }

  .verification-modal-layer {
    padding: 14px;
  }

  .verification-modal {
    max-height: calc(100vh - 28px);
  }
}

@media (max-width: 720px) {
  .verification-request-tile__head,
  .verification-request-tile__footer,
  .verification-payout-card__header,
  .verification-section__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .verification-request-tile__badges {
    align-items: flex-start;
  }

  .verification-request-tile__facts,
  .verification-data-grid,
  .verification-documents-grid,
  .verification-payout-grid {
    grid-template-columns: 1fr;
  }

  .verification-document-card {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .verification-document-card :deep(.doc-actions) {
    grid-column: 1 / -1;
  }

  .verification-modal__footer {
    justify-content: flex-start;
  }
}
</style>
