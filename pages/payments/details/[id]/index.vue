<template>
  <PageStructureDefault>
    <template #header>
      <UiTextH4 class="text-[var(--ui-text-main)] mr-5">
        {{ pageTitle }}
      </UiTextH4>

      <NuxtLink
        :to="backLink"
        class="w-full md:w-auto">
        <UiButtonDefault
          state="info--outline"
          class="w-full md:w-auto">
          {{ backLabel }}
        </UiButtonDefault>
      </NuxtLink>
    </template>

    <template #content>
      <div
        v-if="isLoading"
        class="flex min-h-[40vh] items-center justify-center">
        <UiIconSpinnerDefault />
      </div>

      <div
        v-else-if="errorMessage"
        class="rounded-xl bg-[var(--ui-background-panel)] p-4 text-[var(--ui-sticker-danger)]">
        {{ errorMessage }}
      </div>

      <div
        v-else-if="paymentDetail"
        class="payment-detail-layout">
        <div class="payment-detail-layout__left">
          <section class="payment-detail-card payment-detail-card--main">
            <div class="payment-detail-card__header">
              <div>
                <UiTextSmall class="payment-detail-card__label">Название</UiTextSmall>
                <h3 class="payment-detail-card__title">{{ paymentDetail.name || "-" }}</h3>
              </div>
              <div class="status-inline">
                <span
                  class="status-inline__dot"
                  :class="statusDotClass(paymentDetail.status)"></span>
                <span class="status-inline__text">{{ statusText(paymentDetail.status) }}</span>
              </div>
            </div>

            <div class="payment-detail-card__meta-grid">
              <div class="meta-item">
                <UiTextSmall class="meta-item__label">Платежная система</UiTextSmall>
                <div class="meta-item__value">{{ paymentSystemName }}</div>
              </div>

              <div class="meta-item">
                <UiTextSmall class="meta-item__label">Обновлено</UiTextSmall>
                <div class="updated-at-cell">
                  <span class="updated-at-cell__relative">{{ formatRelativeDate(paymentDetail.updated_at) }}</span>
                  <span class="updated-at-cell__absolute">{{ formatDateTime(paymentDetail.updated_at) }}</span>
                </div>
              </div>

              <div class="meta-item">
                <UiTextSmall class="meta-item__label">Создано</UiTextSmall>
                <div class="meta-item__value">{{ formatDateTime(paymentDetail.created_at) }}</div>
              </div>

              <div class="meta-item">
                <UiTextSmall class="meta-item__label">ID</UiTextSmall>
                <div class="meta-item__value break-all">{{ paymentDetail.id || "-" }}</div>
              </div>
            </div>

            <div
              class="payment-detail-card__comment-section"
              :class="{ 'payment-detail-card__comment-section--has-value': hasAdminComment }">
              <UiTextSmall class="payment-detail-card__comment-label">Комментарий администратора</UiTextSmall>
              <div class="payment-detail-card__comment">
                {{ paymentDetail.admin_comment || "Комментарий отсутствует." }}
              </div>
            </div>
          </section>

          <section class="payment-detail-card">
            <UiTextSmall class="payment-detail-card__label">Поля реквизита</UiTextSmall>
            <div
              v-if="dataRows.length === 0"
              class="payment-detail-card__empty">
              Нет данных.
            </div>
            <div
              v-else
              class="details-fields-grid">
              <div
                v-for="row in dataRows"
                :key="row.key"
                class="details-field">
                <div class="details-field__meta">
                  <div class="details-field__key">{{ row.key }}</div>
                  <div class="details-field__value">{{ row.value }}</div>
                </div>
                <div
                  class="details-field__copy"
                  :title="'Скопировать значение'">
                  <UiIconCopy :text="row.value" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section class="payment-detail-card payment-detail-card--full">
          <div class="payment-detail-card__documents-header">
            <UiTextSmall class="payment-detail-card__label">Скриншоты реквизитов</UiTextSmall>
            <UiTextSmall class="payment-detail-card__counter">Всего: {{ documents.length }}</UiTextSmall>
          </div>

          <div
            v-if="documents.length === 0"
            class="payment-detail-card__empty">
            Документы не загружены.
          </div>
          <div
            v-else
            class="documents-grid">
            <button
              v-for="(document, index) in documents"
              :key="document.path + ':' + index"
              type="button"
              class="document-card"
              @click="openDocument(document)">
              <img
                v-if="document.preview_url"
                :src="document.preview_url"
                :alt="`Документ #${index + 1}`"
                class="document-card__image" />
              <div
                v-else
                class="document-card__fallback">
                FILE
              </div>

              <div class="document-card__meta">
                <span class="document-card__index">#{{ index + 1 }}</span>
                <span
                  class="document-card__name"
                  :title="document.name"
                  >{{ document.name || "Документ" }}</span
                >
              </div>
            </button>
          </div>
        </section>

        <section class="payment-detail-card payment-detail-card--full">
          <div class="payment-detail-card__documents-header">
            <UiTextSmall class="payment-detail-card__label">История изменений реквизита</UiTextSmall>
            <UiTextSmall class="payment-detail-card__counter">Всего: {{ payoutHistoryRows.length }}</UiTextSmall>
          </div>

          <div
            v-if="isHistoryLoading"
            class="payment-detail-card__empty">
            Загрузка истории...
          </div>
          <div
            v-else-if="payoutHistoryRows.length === 0"
            class="payment-detail-card__empty">
            История пока отсутствует.
          </div>
          <div
            v-else
            class="history-list">
            <article
              v-for="historyRow in payoutHistoryRows"
              :key="historyRow.id"
              class="history-item">
              <div class="history-item__top">
                <div class="history-item__title-wrap">
                  <div class="history-item__title">{{ historyRow.name }}</div>
                  <div class="history-item__meta">
                    {{ historyRow.date }}
                    <span v-if="historyRow.actor.name">· {{ historyRow.actor.name }}</span>
                  </div>
                </div>
                <div class="status-inline">
                  <span
                    class="status-inline__dot"
                    :class="statusDotClass(historyRow.status)"></span>
                  <span class="status-inline__text">{{ statusText(historyRow.status) }}</span>
                </div>
              </div>

              <div
                v-if="historyRow.comment"
                class="history-item__comment">
                {{ historyRow.comment }}
              </div>

              <div
                v-if="historyRow.documents.length > 0"
                class="history-item__docs">
                <button
                  v-for="(historyDocument, docIndex) in historyRow.documents"
                  :key="historyRow.id + ':history-doc:' + docIndex"
                  type="button"
                  class="history-item__doc"
                  @click="openDocument(historyDocument)">
                  <img
                    v-if="historyDocument.preview_url"
                    :src="historyDocument.preview_url"
                    :alt="`History document #${docIndex + 1}`"
                    class="history-item__doc-img" />
                  <span
                    v-else
                    class="history-item__doc-fallback"
                    >DOC</span
                  >
                </button>
              </div>
            </article>
          </div>
        </section>
      </div>
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from "vue";
  import { useRoute } from "vue-router";
  import { definePageMeta, useLocalePath } from "~/.nuxt/imports";

  import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import UiTextSmall from "~/components/ui/UiTextSmall.vue";
  import useAppCore from "~/composables/useAppCore";

  definePageMeta({
    layout: "cabinet",
    middleware: ["auth-client", "client-check-auth"],
  });

  type PaymentDetailDocument = {
    name: string;
    path: string;
    preview_url?: string;
    mime_type?: string;
    size?: number | null;
    uploaded_at?: string | null;
  };

  type PayoutHistoryRow = {
    id: string;
    key: string;
    name: string;
    date: string;
    status: "approved" | "pending" | "rejected";
    comment: string;
    actor: {
      id: string;
      type: string;
      name: string;
    };
    documents: PaymentDetailDocument[];
  };

  const appCore = useAppCore();
  const route = useRoute();
  const localePath = useLocalePath();

  const paymentDetail = ref<any | null>(null);
  const isLoading = ref(true);
  const isHistoryLoading = ref(false);
  const errorMessage = ref("");
  const payoutHistoryRows = ref<PayoutHistoryRow[]>([]);

  const paymentDetailId = computed(() => String(route.params.id ?? "").trim());
  const backLink = computed(() => localePath("/payments/details"));
  const backLabel = computed(() => "К списку реквизитов");
  const pageTitle = computed(() => `Реквизит #${paymentDetailId.value}`);
  const hasAdminComment = computed(() => String(paymentDetail.value?.admin_comment ?? "").trim().length > 0);

  const paymentSystemName = computed(() => {
    const direct = String(paymentDetail.value?.payment_system_name ?? "").trim();
    if (direct) return direct;
    return String(paymentDetail.value?.payment_system?.name ?? "-");
  });

  const documents = computed<PaymentDetailDocument[]>(() => {
    const raw = paymentDetail.value?.documents;
    if (!Array.isArray(raw)) return [];
    return raw;
  });

  const dataRows = computed(() => {
    const data = paymentDetail.value?.data;
    if (!data || typeof data !== "object") return [];

    return Object.entries(data)
      .map(([key, value]) => ({
        key: String(key),
        value: String(value ?? "-"),
      }))
      .filter(row => row.key.trim().length > 0);
  });

  const normalizeStatus = (value: unknown): "approved" | "pending" | "rejected" => {
    const normalized = String(value ?? "")
      .trim()
      .toLowerCase();
    if (normalized === "approved" || normalized === "rejected") {
      return normalized;
    }

    return "pending";
  };

  const statusDotClass = (value: unknown): string => {
    const normalized = normalizeStatus(value);
    if (normalized === "approved") return "status-inline__dot--approved";
    if (normalized === "rejected") return "status-inline__dot--rejected";
    return "status-inline__dot--pending";
  };

  const statusText = (value: unknown): string => {
    const normalized = normalizeStatus(value);
    if (normalized === "approved") return "Approved";
    if (normalized === "rejected") return "Rejected";
    return "Pending";
  };

  const formatDateTime = (value: unknown): string => {
    const date = new Date(String(value ?? ""));
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const formatRelativeDate = (value: unknown): string => {
    const date = new Date(String(value ?? ""));
    if (Number.isNaN(date.getTime())) return "-";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} h ago`;

    const diffDays = Math.round(diffHours / 24);
    return `${diffDays} d ago`;
  };

  const openDocument = (document: PaymentDetailDocument) => {
    const target = String(document.preview_url || document.path || "");
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const loadPaymentDetail = async () => {
    if (!paymentDetailId.value) {
      errorMessage.value = "Реквизит не найден.";
      isLoading.value = false;
      return;
    }

    isLoading.value = true;
    errorMessage.value = "";

    try {
      const response = await appCore.paymentDetails.getById(paymentDetailId.value);
      paymentDetail.value = response?.data?.data ?? null;
      if (!paymentDetail.value) {
        errorMessage.value = "Реквизит не найден.";
        payoutHistoryRows.value = [];
      } else {
        await loadPaymentDetailHistory();
      }
    } catch (error: any) {
      errorMessage.value = error?.response?.data?.message || "Не удалось загрузить реквизит.";
      payoutHistoryRows.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  const normalizeHistoryDocuments = (value: unknown): PaymentDetailDocument[] => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((row: any) => ({
      name: String(row?.name ?? ""),
      path: String(row?.path ?? ""),
      preview_url: String(row?.preview_url ?? ""),
      mime_type: String(row?.mime_type ?? ""),
      size: Number.isFinite(Number(row?.size)) ? Number(row?.size) : null,
      uploaded_at: row?.uploaded_at ? String(row.uploaded_at) : null,
    }));
  };

  const loadPaymentDetailHistory = async (): Promise<void> => {
    if (!paymentDetailId.value) {
      payoutHistoryRows.value = [];
      return;
    }

    isHistoryLoading.value = true;

    try {
      const response = await appCore.paymentDetails.getHistory(paymentDetailId.value, { limit: 200 });
      const rawRows = Array.isArray(response?.data?.data) ? response.data.data : [];

      payoutHistoryRows.value = rawRows.map((row: any) => ({
        id: String(row?.id ?? ""),
        key: String(row?.key ?? ""),
        name: String(row?.name ?? ""),
        date: String(row?.date ?? ""),
        status: normalizeStatus(row?.status),
        comment: String(row?.comment ?? ""),
        actor: {
          id: String(row?.actor?.id ?? ""),
          type: String(row?.actor?.type ?? ""),
          name: String(row?.actor?.name ?? ""),
        },
        documents: normalizeHistoryDocuments(row?.documents),
      }));
    } catch (error) {
      payoutHistoryRows.value = [];
    } finally {
      isHistoryLoading.value = false;
    }
  };

  onMounted(loadPaymentDetail);
</script>

<style scoped>
  .payment-detail-layout {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    gap: 12px;
  }

  .payment-detail-layout__left {
    grid-column: span 12;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .payment-detail-card {
    grid-column: span 12;
    border: 0;
    border-radius: 14px;
    background: var(--ui-background-panel);
    padding: 14px;
  }

  .payment-detail-card--full {
    grid-column: span 12;
  }

  .payment-detail-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }

  .payment-detail-card__label {
    color: var(--ui-text-secondary);
  }

  .payment-detail-card__title {
    color: var(--ui-text-main);
    font-size: 20px;
    font-weight: 700;
    line-height: 1.3;
  }

  .payment-detail-card__meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .meta-item {
    min-width: 0;
  }

  .meta-item__label {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .meta-item__value {
    color: var(--ui-text-main);
    font-weight: 600;
    margin-top: 2px;
  }

  .payment-detail-card__empty {
    margin-top: 8px;
    color: var(--ui-text-secondary);
  }

  .payment-detail-card__comment {
    margin-top: 8px;
    color: var(--ui-text-main);
    white-space: pre-wrap;
    line-height: 1.5;
  }

  .payment-detail-card__comment-section {
    margin-top: 12px;
    padding-top: 14px;
    position: relative;
  }

  .payment-detail-card__comment-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 8px;
    background:
      linear-gradient(-45deg, transparent 6px, color-mix(in srgb, var(--ui-primary-main) 22%, transparent) 0) 0 0/12px
        8px repeat-x,
      linear-gradient(45deg, transparent 6px, color-mix(in srgb, var(--ui-primary-main) 22%, transparent) 0) 6px 0/12px
        8px repeat-x;
  }

  .payment-detail-card__comment-section--has-value {
    background: color-mix(in srgb, var(--ui-primary-main) 5%, transparent);
    border-radius: 10px;
    padding: 14px 10px 10px;
    margin: 12px -2px -2px;
  }

  .payment-detail-card__comment-section--has-value::before {
    left: 10px;
    right: 10px;
  }

  .payment-detail-card__comment-label {
    color: var(--ui-text-secondary);
  }

  .payment-detail-card__documents-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .payment-detail-card__counter {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .details-fields-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .details-field {
    border: 0;
    border-radius: 10px;
    padding: 8px 10px;
    background: var(--ui-background);
    width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .details-field__meta {
    min-width: 0;
    flex: 1 1 auto;
  }

  .details-field__key {
    color: var(--ui-text-secondary);
    font-size: 11px;
    margin-bottom: 2px;
  }

  .details-field__value {
    color: var(--ui-text-main);
    font-weight: 600;
    word-break: break-word;
  }

  .details-field__copy {
    flex: 0 0 auto;
    margin-top: 2px;
    color: var(--ui-text-secondary);
  }

  .details-field__copy :deep(.copy-btn) {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--ui-background-panel) 82%, transparent);
  }

  .details-field__copy :deep(.copy-btn:hover) {
    color: var(--ui-text-main);
  }

  .documents-grid {
    margin-top: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }

  .document-card {
    border: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--ui-background);
    text-align: left;
  }

  .document-card__image {
    width: 100%;
    height: 110px;
    object-fit: cover;
    display: block;
  }

  .document-card__fallback {
    width: 100%;
    height: 110px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .document-card__meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
  }

  .document-card__index {
    color: var(--ui-text-secondary);
    font-size: 11px;
  }

  .document-card__name {
    color: var(--ui-text-main);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-list {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .history-item {
    border: 0;
    border-radius: 10px;
    background: var(--ui-background);
    padding: 10px;
  }

  .history-item__top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .history-item__title-wrap {
    min-width: 0;
  }

  .history-item__title {
    color: var(--ui-text-main);
    font-weight: 600;
    line-height: 1.4;
  }

  .history-item__meta {
    color: var(--ui-text-secondary);
    font-size: 12px;
    margin-top: 2px;
  }

  .history-item__comment {
    margin-top: 8px;
    color: var(--ui-text-main);
    font-size: 13px;
    line-height: 1.45;
    white-space: pre-wrap;
  }

  .history-item__docs {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .history-item__doc {
    width: 44px;
    height: 44px;
    border: 0;
    border-radius: 8px;
    overflow: hidden;
    background: var(--ui-background-panel);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  .history-item__doc-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .history-item__doc-fallback {
    color: var(--ui-text-secondary);
    font-size: 10px;
    font-weight: 700;
  }

  .status-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .status-inline__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .status-inline__dot--approved {
    background: #22c55e;
  }

  .status-inline__dot--pending {
    background: #f59e0b;
  }

  .status-inline__dot--rejected {
    background: #ef4444;
  }

  .status-inline__text {
    color: var(--ui-text-main);
    font-weight: 700;
    text-transform: capitalize;
  }

  .updated-at-cell {
    display: inline-flex;
    flex-direction: column;
    line-height: 1.2;
    gap: 2px;
  }

  .updated-at-cell__relative {
    color: var(--ui-text-secondary);
    font-size: 11px;
  }

  .updated-at-cell__absolute {
    color: var(--ui-text-main);
    font-size: 12px;
  }

  @media (max-width: 767px) {
    .payment-detail-card__meta-grid {
      grid-template-columns: 1fr;
    }

    .details-fields-grid {
      grid-template-columns: 1fr;
    }

    .history-item__top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
