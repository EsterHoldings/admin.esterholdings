<template>
  <div class="verification-tabs">
    <button
      v-for="tab in verificationTabs"
      :key="tab.id"
      type="button"
      class="verification-tabs__btn"
      :class="{
        'verification-tabs__btn--active': activeVerificationTab === tab.id,
        'verification-tabs__btn--attention': tab.needsAttention && !seenTabs[tab.id],
      }"
      @click="setVerificationTab(tab.id)"
    >
      <span>{{ tab.label }}</span>
      <span
        v-if="tab.needsAttention && !seenTabs[tab.id]"
        class="verification-tabs__indicator"
      />
    </button>
  </div>

  <div class="verification-pane">
    <template v-if="activeVerificationTab === 'client'">
      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconProfile />
            <div>
              <UiTextH5 class="verification-card__title">Профиль</UiTextH5>
              <div class="verification-card__subtitle">Основные данные клиента для проверки профиля.</div>
            </div>
          </div>

          <div class="verification-card__actions">
            <UiButtonDefault
              state="info--small"
              class="verification-card__refresh"
              @click="handleRefreshActiveTab"
            >
              <UiIconUpdate v-if="!isLoading" />
              <UiIconSpinnerDefault v-else />
            </UiButtonDefault>

            <VerificationActions
              :enable-comment="true"
              :comment="infoComment"
              :status="infoStatus"
              :comment-open="isInfoCommentOpen"
              :disabled="!canUpdateVerifications"
              @update-status="handleVerificationProfile"
              @toggle-comment="toggleInfoComment"
            />
          </div>
        </div>

        <div class="verification-grid">
          <div class="verification-grid__item">
            <span class="verification-grid__label">Имя</span>
            <span class="verification-grid__value">{{ props.userData.first_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Фамилия</span>
            <span class="verification-grid__value">{{ props.userData.last_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Отчество</span>
            <span class="verification-grid__value">{{ props.userData.mid_name || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Дата рождения</span>
            <span class="verification-grid__value">{{ props.userData.birthdate || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Телефон</span>
            <span class="verification-grid__value">{{ props.userData.phone || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Email</span>
            <span class="verification-grid__value">{{ props.userData.email || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Страна</span>
            <span class="verification-grid__value">{{ props.userData.country || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Штат / регион</span>
            <span class="verification-grid__value">{{ props.userData.state || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Город</span>
            <span class="verification-grid__value">{{ props.userData.city || "-" }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Индекс</span>
            <span class="verification-grid__value">{{ props.userData.postal_code || "-" }}</span>
          </div>
          <div class="verification-grid__item verification-grid__item--wide">
            <span class="verification-grid__label">Адрес</span>
            <span class="verification-grid__value">{{ props.userData.address || "-" }}</span>
          </div>
        </div>

        <transition name="comment-expand">
          <div
            v-if="isInfoCommentOpen"
            class="verification-comment-box"
          >
            <UiFormControl :label="t('admin.verifications.comment.label')">
              <UiTextarea
                :value="infoCommentDraft"
                @input="handleInfoCommentInput"
                class="verification-comment-box__textarea"
                :placeholder="t('admin.verifications.comment.placeholder')"
              />
            </UiFormControl>

            <div class="verification-comment-box__actions">
              <UiButtonDefault
                state="info--outline--small"
                :disabled="!canUpdateVerifications"
                @click="submitInfoComment"
              >
                {{ t("admin.verifications.comment.save") }}
              </UiButtonDefault>
              <UiButtonDefault
                state="info--outline--small"
                @click="cancelInfoComment"
              >
                {{ t("admin.verifications.comment.close") }}
              </UiButtonDefault>
            </div>
          </div>
        </transition>
      </section>

      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconDocuments />
            <div>
              <UiTextH5 class="verification-card__title">Документы</UiTextH5>
              <div class="verification-card__subtitle">Паспортные и другие загруженные документы клиента.</div>
            </div>
          </div>

          <VerificationActions
            :enable-comment="true"
            :comment="documentsComment"
            :status="documentsStatus"
            :comment-open="isDocumentsCommentOpen"
            :disabled="!canUpdateVerifications"
            @update-status="handleVerificationDocuments"
            @toggle-comment="toggleDocumentsComment"
          />
        </div>

        <transition name="comment-expand">
          <div
            v-if="isDocumentsCommentOpen"
            class="verification-comment-box"
          >
            <UiFormControl :label="t('admin.verifications.comment.label')">
              <UiTextarea
                :value="documentsCommentDraft"
                @input="handleDocumentsCommentInput"
                class="verification-comment-box__textarea"
                :placeholder="t('admin.verifications.comment.placeholder')"
              />
            </UiFormControl>

            <div class="verification-comment-box__actions">
              <UiButtonDefault
                state="info--outline--small"
                :disabled="!canUpdateVerifications"
                @click="submitDocumentsComment"
              >
                {{ t("admin.verifications.comment.save") }}
              </UiButtonDefault>
              <UiButtonDefault
                state="info--outline--small"
                @click="cancelDocumentsComment"
              >
                {{ t("admin.verifications.comment.close") }}
              </UiButtonDefault>
            </div>
          </div>
        </transition>

        <div
          v-if="documentsListRequestData.length === 0 && !isLoading"
          class="verification-card__empty"
        >
          No documents uploaded.
        </div>

        <div
          v-else
          class="verification-documents-grid"
        >
          <article
            v-for="documentRequestData in documentsListRequestData"
            :key="documentRequestData.id"
            class="verification-document-card"
          >
            <button
              type="button"
              class="verification-document-card__preview"
              @click="handleClientDocumentImage(documentRequestData.document_data.full_url)"
            >
              <img
                v-if="documentRequestData.document_data.full_url"
                :src="documentRequestData.document_data.full_url"
                :alt="documentRequestData.document_data.number || 'Document preview'"
              />
              <span v-else>DOC</span>
            </button>

            <div class="verification-document-card__meta">
              <div class="verification-document-card__title">
                {{ documentRequestData.name || documentRequestData.document_data.number || "Document" }}
              </div>
              <div class="verification-document-card__subtitle">
                {{ documentRequestData.document_data.number || documentRequestData.id }}
              </div>
            </div>

            <VerificationActions
              :status="documentRequestData.state"
              :disabled="!canUpdateVerifications"
              @update-status="handleVerificationDocument($event, documentRequestData.id)"
            />
          </article>
        </div>
      </section>

      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconPaymentDetail />
            <div>
              <UiTextH5 class="verification-card__title">Первый депозит</UiTextH5>
              <div class="verification-card__subtitle">Определяется по фактическому наличию первого депозита.</div>
            </div>
          </div>

          <span
            class="verification-inline-badge"
            :class="firstDeposit ? 'is-approved' : 'is-pending'"
          >
            {{ firstDeposit ? "Есть депозит" : "Депозита нет" }}
          </span>
        </div>

        <div
          v-if="firstDeposit"
          class="verification-grid verification-grid--compact"
        >
          <div class="verification-grid__item">
            <span class="verification-grid__label">Сумма</span>
            <span class="verification-grid__value">{{ formatMoney(firstDeposit.amount, firstDeposit.currency) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Метод</span>
            <span class="verification-grid__value">{{ paymentMethodName(firstDeposit) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Статус</span>
            <span class="verification-grid__value">{{ paymentStatusText(firstDeposit.status) }}</span>
          </div>
          <div class="verification-grid__item">
            <span class="verification-grid__label">Дата</span>
            <span class="verification-grid__value">{{ firstDeposit.created_at || "-" }}</span>
          </div>
        </div>

        <div
          v-else
          class="verification-card__empty"
        >
          У клиента ещё нет депозитов.
        </div>
      </section>
    </template>

    <template v-else-if="activeVerificationTab === 'payout'">
      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconPaymentDetail />
            <div>
              <UiTextH5 class="verification-card__title">Реквизиты</UiTextH5>
              <div class="verification-card__subtitle">Проверка реквизитов и приложенных документов.</div>
            </div>
          </div>

          <UiButtonDefault
            state="info--small"
            class="verification-card__refresh"
            @click="handleRefreshActiveTab"
          >
            <UiIconUpdate v-if="!isPayoutLoading" />
            <UiIconSpinnerDefault v-else />
          </UiButtonDefault>
        </div>

        <div
          v-if="payoutDetails.length === 0 && !isPayoutLoading"
          class="verification-card__empty"
        >
          Реквизитов для выплат пока нет.
        </div>

        <div
          v-else
          class="verification-payout-list"
        >
          <article
            v-for="paymentDetail in payoutDetails"
            :key="paymentDetail.id"
            class="verification-payout-card"
          >
            <div class="verification-payout-card__header">
              <div class="verification-payout-card__title-group">
                <div class="verification-payout-card__title">{{ paymentDetail.name || "Реквизит без названия" }}</div>
                <div class="verification-payout-card__subtitle">
                  {{ paymentDetail.paymentSystemName || "Payment system" }}
                  <span v-if="paymentDetail.updatedAt">· {{ paymentDetail.updatedAt }}</span>
                </div>
              </div>

              <VerificationActions
                :enable-comment="true"
                :comment="resolvePayoutCommentValue(paymentDetail)"
                :comment-open="isPayoutCommentOpen(paymentDetail.id)"
                :status="paymentDetail.status"
                :disabled="!canUpdatePaymentDetails"
                @toggle-comment="togglePayoutComment(paymentDetail)"
                @update-status="handleVerificationPayoutDetail($event, paymentDetail.id)"
              />
            </div>

            <div
              v-if="paymentDetailEntries(paymentDetail).length"
              class="verification-grid verification-grid--compact"
            >
              <div
                v-for="entry in paymentDetailEntries(paymentDetail)"
                :key="`${paymentDetail.id}:${entry.key}`"
                class="verification-grid__item"
              >
                <span class="verification-grid__label">{{ entry.label }}</span>
                <span class="verification-grid__value">{{ entry.value }}</span>
              </div>
            </div>

            <transition name="comment-expand">
              <div
                v-if="isPayoutCommentOpen(paymentDetail.id)"
                class="verification-comment-box"
              >
                <UiFormControl :label="t('admin.verifications.comment.label')">
                  <UiTextarea
                    :value="payoutCommentDraftMap[paymentDetail.id] || ''"
                    @input="handlePayoutCommentInput(paymentDetail.id, $event)"
                    class="verification-comment-box__textarea"
                    :placeholder="t('admin.verifications.comment.placeholder')"
                  />
                </UiFormControl>

                <div class="verification-comment-box__actions">
                  <UiButtonDefault
                    state="info--outline--small"
                    @click="submitPayoutComment(paymentDetail.id)"
                  >
                    {{ t("admin.verifications.comment.save") }}
                  </UiButtonDefault>
                  <UiButtonDefault
                    state="info--outline--small"
                    @click="cancelPayoutComment(paymentDetail.id)"
                  >
                    {{ t("admin.verifications.comment.close") }}
                  </UiButtonDefault>
                </div>
              </div>
            </transition>

            <div
              v-if="paymentDetail.documents.length > 0"
              class="verification-payout-card__documents"
            >
              <button
                v-for="(paymentDetailDocument, documentIndex) in paymentDetail.documents"
                :key="paymentDetail.id + ':' + paymentDetailDocument.path + ':' + documentIndex"
                type="button"
                class="verification-payout-card__document"
                :disabled="isPayoutDocumentLoading(paymentDetail.id, documentIndex)"
                @click="handleOpenPayoutDocument(paymentDetail.id, documentIndex)"
              >
                <img
                  v-if="resolvePayoutDocumentPreviewSrc(paymentDetailDocument)"
                  :src="resolvePayoutDocumentPreviewSrc(paymentDetailDocument)"
                  :alt="`Скриншот #${documentIndex + 1}`"
                />
                <span v-else>DOC</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>

    <template v-else>
      <section class="verification-card">
        <div class="verification-card__header">
          <div class="verification-card__title-group">
            <UiIconDocuments />
            <div>
              <UiTextH5 class="verification-card__title">Запросы на верификацию</UiTextH5>
              <div class="verification-card__subtitle">Список запросов этого клиента. Необработанные всегда сверху.</div>
            </div>
          </div>

          <UiButtonDefault
            state="info--small"
            class="verification-card__refresh"
            @click="handleRefreshActiveTab"
          >
            <UiIconUpdate v-if="!isRequestsLoading" />
            <UiIconSpinnerDefault v-else />
          </UiButtonDefault>
        </div>

        <div
          v-if="isRequestsLoading"
          class="verification-card__empty"
        >
          Loading verification requests...
        </div>

        <div
          v-else-if="sortedClientRequestRows.length === 0"
          class="verification-card__empty"
        >
          Для этого клиента запросов на верификацию пока нет.
        </div>

        <div
          v-else
          class="verification-client-request-list"
        >
          <article
            v-for="requestItem in sortedClientRequestRows"
            :key="requestItem.id"
            class="verification-client-request-card"
            :class="{ 'is-pending-row': requestItem.request_state === 'pending' }"
          >
            <div class="verification-client-request-card__body">
              <div class="verification-client-request-card__top">
                <div class="verification-client-request-card__title-wrap">
                  <div class="verification-client-request-card__title">
                    #{{ shortId(requestItem.id) }}
                  </div>
                  <span
                    class="verification-inline-badge"
                    :class="requestStateClass(requestItem.request_state)"
                  >
                    {{ requestStateText(requestItem.request_state) }}
                  </span>
                </div>

                <div class="verification-client-request-card__meta">
                  {{ requestItem.updated_at_human || requestItem.updated_at || "-" }}
                </div>
              </div>

              <div class="verification-client-request-card__focus">
                <template v-if="currentRequestFocusItems.length">
                  <span
                    v-for="item in currentRequestFocusItems"
                    :key="`${requestItem.id}:${item}`"
                    class="verification-focus-chip"
                  >
                    {{ item }}
                  </span>
                </template>
                <span
                  v-else
                  class="verification-client-request-card__focus-muted"
                >
                  No new sections marked for review
                </span>
              </div>

              <div class="verification-client-request-card__previews">
                <span
                  v-for="(preview, previewIndex) in currentRequestDocumentPreviews"
                  :key="`${requestItem.id}:doc-preview:${previewIndex}`"
                  class="verification-preview-chip"
                >
                  <img
                    v-if="preview"
                    :src="preview"
                    alt="Document preview"
                  />
                  <span v-else>DOC</span>
                </span>

                <span
                  v-for="(preview, previewIndex) in currentRequestPayoutPreviews"
                  :key="`${requestItem.id}:payout-preview:${previewIndex}`"
                  class="verification-preview-chip"
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

            <VerificationRequestStateActions
              :state="requestItem.request_state"
              :disabled="isRequestUpdating(requestItem.id)"
              @update-state="handleRequestReviewUpdate(requestItem.id, $event)"
            />
          </article>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";

import useAppCore from "~/composables/useAppCore";
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

type VerificationTab = "client" | "payout" | "requests";
type VerificationStatus = "approved" | "pending" | "rejected";
type RequestReviewState = "pending" | "viewed" | "approved" | "rejected";
type AdminPaymentDetailStatus = "approved" | "pending" | "rejected";

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
  updated_at: string | null;
  updated_at_human: string | null;
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
const route = useRoute();
const toast = useToast();
const { t } = useI18n({ useScope: "global" });

const isLoading = ref(false);
const isPayoutLoading = ref(false);
const isRequestsLoading = ref(false);
const activeVerificationTab = ref<VerificationTab>("client");

const verificationRequestData = reactive<VerificationRequestDto>({ ...initialData });
const documentsListRequestData = ref<VerificationDocumentItem[]>([]);
const payoutDetails = ref<AdminPaymentDetailItem[]>([]);
const firstDeposit = ref<PaymentRow | null>(null);
const clientRequestRows = ref<ClientVerificationRequestRow[]>([]);
const requestUpdatingState = reactive<Record<string, boolean>>({});

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
  if (normalized === "viewed" || normalized === "approved" || normalized === "rejected") {
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
    updated_at: row?.updated_at ? String(row.updated_at) : null,
    updated_at_human: row?.updated_at_human ? String(row.updated_at_human) : null,
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

const parseVerificationTabFromLocation = (): VerificationTab => {
  if (typeof window === "undefined") {
    return parseVerificationTabFromRoute(route.query.verificationTab);
  }

  const fromUrl = new URL(window.location.href).searchParams.get("verificationTab");
  return parseVerificationTabFromRoute(fromUrl);
};

const syncVerificationTabInLocation = (tab: VerificationTab): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  if (tab === "client") {
    url.searchParams.delete("verificationTab");
  } else {
    url.searchParams.set("verificationTab", tab);
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

const resolvePayoutDocumentPreviewSrc = (document: AdminPaymentDetailDocument): string => {
  if (document.previewUrl) {
    return document.previewUrl;
  }

  return isAbsoluteHttpUrl(document.path) ? document.path : "";
};

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
    const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId);
    const rawRows = Array.isArray(response?.data?.data) ? response.data.data : [];

    payoutDetails.value = rawRows.map((row: any) => ({
      id: String(row.id),
      name: String(row.name ?? ""),
      status: normalizePaymentStatus(row.status),
      paymentSystemName: String(row?.payment_system?.name ?? row?.paymentSystem?.name ?? ""),
      updatedAt: String(row.updated_at ?? ""),
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
    case "viewed":
      return 1;
    case "approved":
      return 2;
    case "rejected":
      return 3;
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

const hasPendingProfile = computed(() => infoStatus.value === "pending");
const hasPendingDocuments = computed(
  () => documentsStatus.value === "pending" || documentsListRequestData.value.some(document => document.state === "pending")
);
const hasPendingPayout = computed(() => payoutDetails.value.some(paymentDetail => paymentDetail.status === "pending"));
const hasPendingRequests = computed(() => clientRequestRows.value.some(request => request.request_state === "pending"));

const currentRequestFocusItems = computed(() => {
  const items: string[] = [];

  if (hasPendingProfile.value) {
    items.push("Profile");
  }

  if (hasPendingDocuments.value) {
    items.push(`Documents${documentsListRequestData.value.length ? ` (${documentsListRequestData.value.length})` : ""}`);
  }

  if (hasPendingPayout.value) {
    items.push(`Requisites${payoutDetails.value.length ? ` (${payoutDetails.value.length})` : ""}`);
  }

  return items;
});

const currentRequestDocumentPreviews = computed(() =>
  documentsListRequestData.value
    .map(document => String(document.document_data.full_url || "").trim())
    .filter(Boolean)
    .slice(0, 2)
);

const currentRequestPayoutPreviews = computed(() =>
  payoutDetails.value
    .flatMap(paymentDetail => paymentDetail.documents)
    .map(resolvePayoutDocumentPreviewSrc)
    .filter(Boolean)
    .slice(0, 2)
);

const verificationTabs = computed(() => [
  {
    id: "client" as const,
    label: "Общая верификация",
    needsAttention: hasPendingProfile.value || hasPendingDocuments.value,
  },
  {
    id: "payout" as const,
    label: "Реквизиты",
    needsAttention: hasPendingPayout.value,
  },
  {
    id: "requests" as const,
    label: "Запросы",
    needsAttention: hasPendingRequests.value,
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

const setVerificationTab = (tab: VerificationTab) => {
  if (activeVerificationTab.value === tab) {
    return;
  }

  activeVerificationTab.value = tab;
  syncVerificationTabInLocation(tab);

  void nextTick(() => {
    markTabSeen(tab);
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
    toast.success("Documents status updated!");
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
    toast.success("Document status updated!");
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
    toast.success("Profile status updated!");
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
    toast.success("Payment details status updated!");
    payoutCommentOpenMap[paymentDetailId] = false;
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
    toast.error("Документ не найден.");
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
    toast.error("Не удалось открыть документ.");
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

    toast.success("Request status updated.");
    await loadClientVerificationRequests();
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update request status.");
  } finally {
    delete requestUpdatingState[requestId];
  }
};

const isRequestUpdating = (requestId: string): boolean => Boolean(requestUpdatingState[requestId]);

const paymentDetailEntries = (paymentDetail: AdminPaymentDetailItem): Array<{ key: string; label: string; value: string }> =>
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
    || "Deposit"
  );
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

const requestStateText = (state: RequestReviewState): string => {
  switch (state) {
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

const requestStateClass = (state: RequestReviewState): string => `is-${state}`;

const handleClientDocumentImage = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
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

onMounted(async () => {
  activeVerificationTab.value = parseVerificationTabFromLocation();

  await Promise.all([loadVerificationData(), loadPayoutVerificationData(), loadClientVerificationRequests()]);

  await nextTick();
  markTabSeen(activeVerificationTab.value);
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

.verification-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.03);
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
.verification-payout-card,
.verification-client-request-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
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

.verification-payout-card__documents,
.verification-client-request-card__previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.verification-inline-badge.is-viewed {
  background: rgba(73, 108, 222, 0.14);
  border-color: rgba(73, 108, 222, 0.24);
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

.verification-client-request-card.is-pending-row {
  border-color: rgba(233, 174, 0, 0.24);
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
  .verification-payout-card__header,
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
}

@media (max-width: 680px) {
  .verification-grid,
  .verification-grid--compact {
    grid-template-columns: 1fr;
  }

  .verification-grid__item--wide {
    grid-column: span 1;
  }
}
</style>
