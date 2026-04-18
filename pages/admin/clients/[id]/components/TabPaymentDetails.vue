<template>
  <div class="client-payment-details-tab">
    <div class="client-payment-details-tab__summary">
      <PrimeCard
        v-for="card in summaryCards"
        :key="card.id"
        class="client-payment-card client-payment-card--summary">
        <template #content>
          <div class="client-payment-card__body">
            <span class="client-payment-card__label">{{ card.label }}</span>
            <strong class="client-payment-card__value">{{ card.value }}</strong>
            <span class="client-payment-card__hint">{{ card.hint }}</span>
          </div>
        </template>
      </PrimeCard>
    </div>

    <div class="client-payment-details-tab__toolbar">
      <PrimeSelect
        v-model="archiveFilter"
        :options="archiveFilterOptions"
        option-label="label"
        option-value="value"
        class="client-payment-details-tab__filter"
        @update:model-value="loadPaymentDetails" />

      <PrimeButton
        icon="pi pi-refresh"
        rounded
        :loading="isLoading"
        :aria-label="text('admin.clients.common.refresh', 'Refresh')"
        @click="loadPaymentDetails" />
    </div>

    <div
      v-if="isLoading && pagedPaymentDetails.length === 0"
      class="client-payment-details-tab__list">
      <PrimeSkeleton
        v-for="index in 4"
        :key="`payment-detail-skeleton-${index}`"
        height="116px"
        border-radius="20px" />
    </div>

    <PrimeCard
      v-else-if="paymentDetails.length === 0"
      class="client-payment-empty">
      <template #content>
        <div class="client-payment-empty__body">
          <i class="pi pi-credit-card" />
          <strong>{{ text("admin.clients.paymentDetails.emptyTitle", "No payment details yet") }}</strong>
          <span>{{ text("admin.clients.paymentDetails.emptySubtitle", "Client payment details will appear here after submission.") }}</span>
        </div>
      </template>
    </PrimeCard>

    <div
      v-else
      class="client-payment-details-tab__list">
      <PrimeCard
        v-for="paymentDetail in pagedPaymentDetails"
        :key="paymentDetail.id"
        class="client-payment-card client-payment-card--row">
        <template #content>
          <div class="client-payment-row">
            <div class="client-payment-row__header">
              <div class="client-payment-row__title">
                <i class="pi pi-credit-card" aria-hidden="true" />
                <div>
                  <h3>{{ paymentDetail.name || "-" }}</h3>
                  <span>{{ paymentDetail.paymentSystemName || "-" }}</span>
                </div>
              </div>

              <span
                class="client-inline-status"
                :class="statusClass(paymentDetail.status)">
                {{ statusText(paymentDetail.status) }}
              </span>
            </div>

            <div class="client-payment-row__grid">
              <div
                v-for="field in paymentPrimaryFields(paymentDetail)"
                :key="`${paymentDetail.id}:${field.key}`"
                class="client-data-item">
                <span class="client-data-item__label">{{ field.label }}</span>
                <strong class="client-data-item__value">{{ field.value || "-" }}</strong>
              </div>

              <div class="client-data-item">
                <span class="client-data-item__label">{{ text("admin.clients.paymentDetails.columns.updatedAt", "Updated at") }}</span>
                <strong class="client-data-item__value">{{ formatDateTime(paymentDetail.updatedAt) }}</strong>
              </div>
            </div>

            <div
              v-if="paymentDetail.documents.length"
              class="client-payment-row__documents">
              <button
                v-for="(document, index) in paymentDetail.documents"
                :key="`${paymentDetail.id}:document:${index}`"
                type="button"
                class="client-payment-document"
                @click="openDocument(document)">
                <img
                  v-if="document.previewUrl"
                  :src="document.previewUrl"
                  :alt="document.name || text('admin.clients.paymentDetails.documentAlt', 'Payment detail document')" />
                <span v-else>{{ documentLabel(document, index) }}</span>
              </button>
            </div>

            <div
              v-if="paymentDetail.adminComment"
              class="client-payment-row__comment">
              <span>{{ text("admin.clients.paymentDetails.adminComment", "Admin comment") }}</span>
              <strong>{{ paymentDetail.adminComment }}</strong>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimePaginator
      v-if="paymentDetails.length > perPage"
      :first="(page - 1) * perPage"
      :rows="perPage"
      :total-records="paymentDetails.length"
      :rows-per-page-options="[5, 10, 20, 50]"
      @page="handlePaginatorPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import useAppCore from "~/composables/useAppCore";

type PaymentDetailStatus = "approved" | "pending" | "rejected";
type ArchiveFilter = "active" | "archived" | "all";

interface AdminPaymentDetailDocument {
  path: string;
  previewUrl: string;
  name: string;
  mimeType: string;
}

interface AdminPaymentDetail {
  id: string;
  name: string;
  status: PaymentDetailStatus;
  paymentSystemName: string;
  updatedAt: string;
  adminComment: string;
  data: Record<string, unknown>;
  documents: AdminPaymentDetailDocument[];
}

const props = defineProps<{
  clientId: string;
}>();

const appCore = useAppCore();
const { t, te, locale } = useI18n({ useScope: "global" });

const paymentDetails = ref<AdminPaymentDetail[]>([]);
const isLoading = ref(false);
const page = ref(1);
const perPage = ref(10);
const archiveFilter = ref<ArchiveFilter>("active");

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

const archiveFilterOptions = computed(() => [
  { value: "active", label: text("admin.clients.paymentDetails.filters.active", "Active") },
  { value: "archived", label: text("admin.clients.paymentDetails.filters.archived", "Archived") },
  { value: "all", label: text("admin.clients.paymentDetails.filters.all", "All") },
]);

const summaryCards = computed(() => {
  const approved = paymentDetails.value.filter(item => item.status === "approved").length;
  const pending = paymentDetails.value.filter(item => item.status === "pending").length;
  const rejected = paymentDetails.value.filter(item => item.status === "rejected").length;

  return [
    {
      id: "total",
      label: text("admin.clients.paymentDetails.summary.total", "Total requisites"),
      value: formatCount(paymentDetails.value.length),
      hint: text("admin.clients.paymentDetails.summary.totalHint", "Payment details in selected filter"),
    },
    {
      id: "approved",
      label: text("admin.clients.paymentDetails.summary.approved", "Approved"),
      value: formatCount(approved),
      hint: text("admin.clients.paymentDetails.summary.approvedHint", "Ready for withdrawals"),
    },
    {
      id: "pending",
      label: text("admin.clients.paymentDetails.summary.pending", "Pending"),
      value: formatCount(pending),
      hint: text("admin.clients.paymentDetails.summary.pendingHint", "Waiting for moderation"),
    },
    {
      id: "rejected",
      label: text("admin.clients.paymentDetails.summary.rejected", "Rejected"),
      value: formatCount(rejected),
      hint: text("admin.clients.paymentDetails.summary.rejectedHint", "Rejected by admin"),
    },
  ];
});

const pagedPaymentDetails = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return paymentDetails.value.slice(start, start + perPage.value);
});

const normalizeStatus = (value: unknown): PaymentDetailStatus => {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "approved" || normalized === "rejected") {
    return normalized;
  }

  return "pending";
};

const normalizeDocuments = (documents: unknown): AdminPaymentDetailDocument[] => {
  if (!Array.isArray(documents)) {
    return [];
  }

  return documents
    .map((document: any) => ({
      path: String(document?.path ?? ""),
      previewUrl: String(document?.preview_url ?? document?.previewUrl ?? ""),
      name: String(document?.name ?? ""),
      mimeType: String(document?.mime_type ?? document?.mimeType ?? ""),
    }))
    .filter(document => document.path !== "" || document.previewUrl !== "");
};

const normalizePaymentDetail = (row: any): AdminPaymentDetail => ({
  id: String(row?.id ?? ""),
  name: String(row?.name ?? ""),
  status: normalizeStatus(row?.status),
  paymentSystemName: String(row?.payment_system?.name ?? row?.paymentSystem?.name ?? row?.payment_system_name ?? ""),
  updatedAt: String(row?.updated_at ?? ""),
  adminComment: String(row?.admin_comment ?? ""),
  data: row?.data && typeof row.data === "object" && !Array.isArray(row.data) ? row.data : {},
  documents: normalizeDocuments(row?.documents),
});

const normalizeLabel = (value: string): string =>
  value.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase()).trim();

const fieldLabel = (key: string): string =>
  text(`admin.clients.paymentDetails.fields.${key}`, normalizeLabel(key));

const formatValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(formatValue).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(formatValue).filter(Boolean).join(", ");
  }

  return String(value ?? "").trim();
};

const paymentPrimaryFields = (paymentDetail: AdminPaymentDetail): Array<{ key: string; label: string; value: string }> => {
  const fields = paymentDetail.data?.fields;
  const source = fields && typeof fields === "object" && !Array.isArray(fields)
    ? fields as Record<string, unknown>
    : Object.fromEntries(Object.entries(paymentDetail.data).filter(([key]) => !["fields", "legacy"].includes(key)));

  return Object.entries(source)
    .map(([key, value]) => ({
      key,
      label: fieldLabel(key),
      value: formatValue(value),
    }))
    .filter(field => field.value !== "")
    .slice(0, 6);
};

const formatCount = (value: number): string => new Intl.NumberFormat(locale.value || "en").format(Number(value || 0));

const formatDateTime = (value: string): string => {
  const normalized = String(value || "").trim();
  if (normalized === "") {
    return "-";
  }

  const date = new Date(normalized.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) {
    return normalized;
  }

  return new Intl.DateTimeFormat(locale.value || "en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const statusText = (status: PaymentDetailStatus): string => {
  switch (status) {
    case "approved":
      return text("admin.verifications.status.approved", "Approved");
    case "rejected":
      return text("admin.verifications.status.rejected", "Rejected");
    default:
      return text("admin.verifications.status.pending", "Pending");
  }
};

const statusClass = (status: PaymentDetailStatus): string => {
  if (status === "approved") {
    return "client-inline-status--success";
  }

  if (status === "rejected") {
    return "client-inline-status--danger";
  }

  return "client-inline-status--warning";
};

const documentLabel = (document: AdminPaymentDetailDocument, index: number): string => {
  const extension = String(document.path || document.name || "").split("?")[0].split(".").pop()?.toUpperCase();
  return extension && extension.length <= 5 ? extension : `#${index + 1}`;
};

const openDocument = (document: AdminPaymentDetailDocument): void => {
  const url = document.previewUrl || document.path;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const loadPaymentDetails = async (): Promise<void> => {
  isLoading.value = true;

  try {
    const response = await appCore.adminModules.clients.getPaymentDetails(props.clientId, {
      archived: archiveFilter.value,
    });

    const rows = Array.isArray(response?.data?.data) ? response.data.data : [];
    paymentDetails.value = rows.map(normalizePaymentDetail);
    page.value = 1;
  } finally {
    isLoading.value = false;
  }
};

const handlePaginatorPage = (event: { page: number; rows: number }): void => {
  page.value = Number(event.page || 0) + 1;
  perPage.value = Number(event.rows || perPage.value);
};

onMounted(loadPaymentDetails);
</script>

<style scoped lang="scss">
.client-payment-details-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.client-payment-details-tab__summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.client-payment-card,
.client-payment-empty {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
  border-radius: 20px;
  background:
    radial-gradient(circle at 14% 0%, color-mix(in srgb, var(--ui-primary-main) 7%, transparent), transparent 36%),
    color-mix(in srgb, var(--ui-background-panel) 86%, transparent);
  box-shadow: 0 14px 36px color-mix(in srgb, #000000 9%, transparent);
  backdrop-filter: blur(18px) saturate(128%);
  -webkit-backdrop-filter: blur(18px) saturate(128%);
}

.client-payment-card :deep(.p-card-body),
.client-payment-card :deep(.p-card-content),
.client-payment-empty :deep(.p-card-body),
.client-payment-empty :deep(.p-card-content) {
  padding: 0;
}

.client-payment-card__body {
  min-height: 104px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 13px;
}

.client-payment-card__label,
.client-payment-card__hint {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 720;
  line-height: 1.35;
}

.client-payment-card__value {
  color: var(--ui-text-main);
  font-size: clamp(22px, 2vw, 32px);
  font-weight: 860;
  line-height: 1;
  letter-spacing: -0.04em;
}

.client-payment-details-tab__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.client-payment-details-tab__filter {
  width: min(100%, 220px);
}

.client-payment-details-tab__list {
  display: grid;
  gap: 10px;
}

.client-payment-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 13px;
}

.client-payment-row__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.client-payment-row__title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.client-payment-row__title > i {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  border-radius: 14px;
  color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
}

.client-payment-row__title h3 {
  margin: 0;
  color: var(--ui-text-main);
  font-size: 16px;
  font-weight: 840;
  line-height: 1.16;
}

.client-payment-row__title span {
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.client-payment-row__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.client-payment-row__documents {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.client-payment-document {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
  border-radius: 13px;
  background: color-mix(in srgb, var(--ui-background-card) 58%, transparent);
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 820;
}

.client-payment-document img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.client-payment-row__comment {
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid color-mix(in srgb, var(--color-warning) 20%, var(--color-stroke-ui-light));
  background: color-mix(in srgb, var(--color-warning) 8%, transparent);
}

.client-payment-row__comment span {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 720;
}

.client-payment-row__comment strong {
  color: var(--ui-text-main);
  font-size: 13px;
  font-weight: 760;
}

.client-payment-empty__body {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: var(--ui-text-secondary);
  text-align: center;
}

.client-payment-empty__body .pi {
  color: var(--ui-primary-main);
  font-size: 30px;
}

.client-payment-empty__body strong {
  color: var(--ui-text-main);
  font-size: 17px;
  font-weight: 840;
}

.client-payment-empty__body span {
  max-width: 420px;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 1100px) {
  .client-payment-details-tab__summary,
  .client-payment-row__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .client-payment-details-tab {
    padding: 12px;
  }

  .client-payment-details-tab__summary,
  .client-payment-row__grid {
    grid-template-columns: 1fr;
  }

  .client-payment-details-tab__toolbar {
    flex-direction: column;
  }

  .client-payment-details-tab__filter {
    width: 100%;
  }

  .client-payment-row__header {
    flex-direction: column;
  }
}
</style>
