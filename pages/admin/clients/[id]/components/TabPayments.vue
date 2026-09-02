<template>
  <div class="client-payments-tab">
    <div class="client-payments-tab__toolbar">
      <span class="client-payments-tab__search">
        <i
          class="pi pi-search"
          aria-hidden="true" />
        <PrimeInputText
          v-model="searchInput"
          class="pr-10"
          :placeholder="text('admin.clients.payments.searchPlaceholder', 'Search payments')"
          fluid />
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-2 inline-flex h-7 w-7 items-center justify-center rounded-lg text-[var(--ui-text-secondary)] transition hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_12%,transparent)] hover:text-[var(--ui-text-main)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--ui-primary-main)]"
          aria-label="Clear"
          @click="searchInput = ''">
          <i
            class="pi pi-times text-xs"
            aria-hidden="true" />
        </button>
      </span>

      <PrimeButton
        icon="pi pi-refresh"
        rounded
        :loading="isLoading"
        :aria-label="text('admin.clients.common.refresh', 'Refresh')"
        @click="loadPayments" />
    </div>

    <div
      v-if="isLoading && payments.length === 0"
      class="client-payments-tab__list">
      <PrimeSkeleton
        v-for="index in 5"
        :key="`client-payment-skeleton-${index}`"
        height="76px"
        border-radius="16px" />
    </div>

    <div
      v-else-if="payments.length === 0"
      class="client-payments-empty">
      <i class="pi pi-receipt" />
      <strong>{{ text("admin.clients.payments.emptyTitle", "No payments yet") }}</strong>
      <span>{{
        text("admin.clients.payments.emptySubtitle", "Client deposits, withdrawals and transfers will appear here.")
      }}</span>
    </div>

    <div
      v-else
      class="client-payments-tab__list">
      <article
        v-for="payment in payments"
        :key="payment.id"
        class="client-payment-row">
        <div class="client-payment-row__id">
          <button
            type="button"
            class="client-payment-row__copy"
            :aria-label="text('admin.clients.payments.copyId', 'Copy payment ID')"
            @click.stop>
            <UiIconCopy :text="payment.id" />
          </button>
          <div>
            <strong>#{{ shortId(payment.id) }}</strong>
            <span>{{ formatDateTime(payment.created_at) }}</span>
          </div>
        </div>

        <div class="client-payment-row__meta">
          <div>
            <span>{{ text("admin.clients.payments.columns.type", "Type") }}</span>
            <strong>{{ payment.type || "-" }}</strong>
          </div>
          <div>
            <span>{{ text("admin.clients.payments.columns.method", "Payment method") }}</span>
            <strong>{{ payment.payment_system_name || payment.payment_gateway || "-" }}</strong>
          </div>
          <div>
            <span>{{ text("admin.clients.payments.columns.account", "Account") }}</span>
            <strong>{{ payment.account_number || "-" }}</strong>
          </div>
        </div>

        <div class="client-payment-row__side">
          <strong>{{ formatMoney(payment.amount, payment.currency || payment.account_currency || "USD") }}</strong>
          <span
            class="client-payment-row__status"
            :class="statusClass(payment.status)">
            <i aria-hidden="true" />
            {{ statusText(payment.status) }}
          </span>
        </div>
      </article>
    </div>

    <PrimePaginator
      v-if="totalRows > perPage"
      :first="(page - 1) * perPage"
      :rows="perPage"
      :total-records="totalRows"
      :rows-per-page-options="[5, 10, 20, 50]"
      @page="handlePaginatorPage" />
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from "vue";
  import { useI18n } from "vue-i18n";
  import UiIconCopy from "~/components/ui/UiIconCopy.vue";
  import useAppCore from "~/composables/useAppCore";

  type ClientPayment = {
    id: string;
    type: string;
    status: string;
    amount: number;
    currency: string;
    account_currency: string;
    payment_gateway: string;
    payment_system_name: string;
    account_number: string;
    created_at: string;
  };

  const props = defineProps<{
    clientId: string;
  }>();

  const appCore = useAppCore();
  const { t, te, locale } = useI18n({ useScope: "global" });

  const payments = ref<ClientPayment[]>([]);
  const page = ref(1);
  const perPage = ref(10);
  const totalRows = ref(0);
  const isLoading = ref(false);
  const searchInput = ref("");
  const searchFilter = ref("");
  let searchTimer: ReturnType<typeof setTimeout> | null = null;

  const text = (key: string, fallback: string): string => (te(key) ? String(t(key)) : fallback);

  const extractRows = (response: any): any[] => {
    const payload = response?.data?.data ?? {};
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  };

  const normalizePayment = (row: any): ClientPayment => ({
    id: String(row?.id ?? ""),
    type: String(row?.type ?? ""),
    status: String(row?.status ?? ""),
    amount: Number(row?.amount ?? 0),
    currency: String(row?.currency ?? ""),
    account_currency: String(row?.account_currency ?? ""),
    payment_gateway: String(row?.payment_gateway ?? ""),
    payment_system_name: String(row?.payment_system_name ?? ""),
    account_number: String(row?.account_number ?? ""),
    created_at: String(row?.created_at ?? ""),
  });

  const loadPayments = async (): Promise<void> => {
    isLoading.value = true;

    try {
      const response = await appCore.payments.getClientPayments(props.clientId, {
        page: page.value,
        perPage: perPage.value,
        searchFilter: searchFilter.value,
        orderBy: "created_at",
        orderDirection: "desc",
      });

      const payload = response?.data?.data ?? {};
      const rows = extractRows(response);
      payments.value = rows.map(normalizePayment);
      totalRows.value = Number(payload?.total ?? rows.length);
      page.value = Number(payload?.current_page ?? page.value);
      perPage.value = Number(payload?.per_page ?? perPage.value);
    } finally {
      isLoading.value = false;
    }
  };

  const handlePaginatorPage = async (event: { page: number; rows: number }): Promise<void> => {
    page.value = Number(event.page || 0) + 1;
    perPage.value = Number(event.rows || perPage.value);
    await loadPayments();
  };

  watch(searchInput, value => {
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      searchFilter.value = value.trim();
      page.value = 1;
      await loadPayments();
    }, 300);
  });

  const shortId = (value: string): string => {
    const normalized = String(value || "").trim();
    return normalized ? normalized.split("-").pop() || normalized : "-";
  };

  const formatDateTime = (value: string): string => {
    const date = new Date(String(value || "").replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return value || "-";

    return new Intl.DateTimeFormat(locale.value || "en", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatMoney = (value: number, currency = "USD"): string => {
    const amount = Number(value || 0);
    const code = String(currency || "USD").toUpperCase();

    try {
      return new Intl.NumberFormat(locale.value || "en", {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${amount.toFixed(2)} ${code}`;
    }
  };

  const statusText = (value: string): string => {
    const normalized = String(value || "").toLowerCase();
    const key = `admin.clients.payments.statuses.${normalized}`;
    return te(key) ? String(t(key)) : normalized || "-";
  };

  const statusClass = (value: string): string => {
    const normalized = String(value || "").toLowerCase();
    if (normalized === "successful" || normalized === "approved") return "is-success";
    if (["failed", "cancelled", "rejected"].includes(normalized)) return "is-danger";
    if (normalized === "processing") return "is-info";
    return "is-pending";
  };

  onMounted(loadPayments);

  onBeforeUnmount(() => {
    if (searchTimer) clearTimeout(searchTimer);
  });
</script>

<style scoped lang="scss">
  .client-payments-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
  }

  .client-payments-tab__toolbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .client-payments-tab__search {
    position: relative;
    display: flex;
    align-items: center;
  }

  .client-payments-tab__search > i {
    position: absolute;
    left: 14px;
    z-index: 1;
    color: var(--ui-text-secondary);
  }

  .client-payments-tab__search :deep(.p-inputtext) {
    padding-left: 40px;
  }

  .client-payments-tab__list {
    display: grid;
    gap: 8px;
  }

  .client-payment-row {
    display: grid;
    grid-template-columns: minmax(180px, 0.85fr) minmax(260px, 1.6fr) auto;
    gap: 14px;
    align-items: center;
    padding: 12px 14px;
    border: 1px solid color-mix(in srgb, var(--ui-primary-main) 14%, var(--color-stroke-ui-light));
    border-radius: 16px;
    background: color-mix(in srgb, var(--ui-background-panel) 88%, transparent);
  }

  .client-payment-row__id {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .client-payment-row__copy {
    flex: 0 0 auto;
    color: var(--ui-text-secondary);
  }

  .client-payment-row__id strong,
  .client-payment-row__side strong {
    color: var(--ui-text-main);
    font-weight: 820;
  }

  .client-payment-row__id span,
  .client-payment-row__meta span {
    color: var(--ui-text-secondary);
    font-size: 12px;
  }

  .client-payment-row__meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }

  .client-payment-row__meta > div {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .client-payment-row__meta strong {
    overflow: hidden;
    color: var(--ui-text-main);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .client-payment-row__side {
    display: grid;
    justify-items: end;
    gap: 6px;
  }

  .client-payment-row__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--ui-text-secondary);
    font-size: 12px;
    font-weight: 720;
  }

  .client-payment-row__status i {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--ui-text-secondary);
  }

  .client-payment-row__status.is-success i {
    background: var(--ui-sticker-success);
  }

  .client-payment-row__status.is-danger i {
    background: var(--ui-sticker-danger);
  }

  .client-payment-row__status.is-info i {
    background: var(--ui-primary-main);
  }

  .client-payment-row__status.is-pending i {
    background: var(--ui-sticker-warning);
  }

  .client-payments-empty {
    min-height: 260px;
    display: grid;
    place-items: center;
    gap: 8px;
    color: var(--ui-text-secondary);
    text-align: center;
  }

  .client-payments-empty .pi {
    color: var(--ui-primary-main);
    font-size: 30px;
  }

  .client-payments-empty strong {
    color: var(--ui-text-main);
    font-size: 17px;
    font-weight: 840;
  }

  @media (max-width: 980px) {
    .client-payment-row,
    .client-payment-row__meta {
      grid-template-columns: 1fr;
    }

    .client-payment-row__side {
      justify-items: start;
    }
  }

  @media (max-width: 640px) {
    .client-payments-tab {
      padding: 12px;
    }

    .client-payments-tab__toolbar {
      grid-template-columns: 1fr;
    }
  }
</style>
