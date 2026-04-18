<template>
  <div class="client-accounts-tab">
    <div class="client-accounts-tab__summary">
      <PrimeCard
        v-for="card in summaryCards"
        :key="card.id"
        class="client-accounts-card client-accounts-card--summary">
        <template #content>
          <div class="client-accounts-card__body">
            <span class="client-accounts-card__label">{{ card.label }}</span>
            <strong class="client-accounts-card__value">{{ card.value }}</strong>
            <span class="client-accounts-card__hint">{{ card.hint }}</span>
          </div>
        </template>
      </PrimeCard>
    </div>

    <div class="client-accounts-tab__toolbar">
      <span class="client-accounts-tab__search">
        <i class="pi pi-search" aria-hidden="true" />
        <PrimeInputText
          v-model="searchInput"
          :placeholder="text('admin.clients.accounts.searchPlaceholder', 'Search by account number or type')"
          fluid />
      </span>

      <PrimeButton
        icon="pi pi-refresh"
        rounded
        :loading="isLoading"
        :aria-label="text('admin.clients.common.refresh', 'Refresh')"
        @click="loadAccounts" />
    </div>

    <div
      v-if="isLoading && accounts.length === 0"
      class="client-accounts-tab__list">
      <PrimeSkeleton
        v-for="index in 4"
        :key="`account-skeleton-${index}`"
        height="92px"
        border-radius="20px" />
    </div>

    <PrimeCard
      v-else-if="accounts.length === 0"
      class="client-accounts-empty">
      <template #content>
        <div class="client-accounts-empty__body">
          <i class="pi pi-wallet" />
          <strong>{{ text("admin.clients.accounts.emptyTitle", "No accounts yet") }}</strong>
          <span>{{ text("admin.clients.accounts.emptySubtitle", "Client MT accounts will appear here after creation.") }}</span>
        </div>
      </template>
    </PrimeCard>

    <div
      v-else
      class="client-accounts-tab__list">
      <PrimeCard
        v-for="account in accounts"
        :key="account.id"
        class="client-accounts-card client-accounts-card--row">
        <template #content>
          <div class="client-accounts-row">
            <div class="client-accounts-row__main">
              <div class="client-accounts-row__title">
                <i
                  class="pi"
                  :class="account.is_favorite ? 'pi-star-fill' : 'pi-wallet'"
                  aria-hidden="true" />
                <div>
                  <h3>{{ account.number || "-" }}</h3>
                  <span>{{ account.type_name || account.type_group || "-" }}</span>
                </div>
              </div>

              <span
                v-if="account.is_favorite"
                class="client-inline-status client-inline-status--success">
                {{ text("admin.clients.accounts.favorite", "Favorite") }}
              </span>
            </div>

            <div class="client-accounts-row__grid">
              <div class="client-data-item">
                <span class="client-data-item__label">{{ text("admin.clients.accounts.columns.balance", "Balance") }}</span>
                <strong class="client-data-item__value">{{ formatMoney(account.balance, account.currency) }}</strong>
              </div>
              <div class="client-data-item">
                <span class="client-data-item__label">{{ text("admin.clients.accounts.columns.leverage", "Leverage") }}</span>
                <strong class="client-data-item__value">{{ account.leverage_display || "-" }}</strong>
              </div>
              <div class="client-data-item">
                <span class="client-data-item__label">{{ text("admin.clients.accounts.columns.paymentType", "Payment type") }}</span>
                <strong class="client-data-item__value">{{ account.payment_type || "-" }}</strong>
              </div>
              <div class="client-data-item">
                <span class="client-data-item__label">{{ text("admin.clients.accounts.columns.createdAt", "Created at") }}</span>
                <strong class="client-data-item__value">{{ formatDateTime(account.created_at) }}</strong>
              </div>
            </div>
          </div>
        </template>
      </PrimeCard>
    </div>

    <PrimePaginator
      v-if="totalRows > 0"
      :first="(page - 1) * perPage"
      :rows="perPage"
      :total-records="totalRows"
      :rows-per-page-options="[5, 10, 20, 50]"
      @page="handlePaginatorPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import useAppCore from "~/composables/useAppCore";

interface AdminClientAccount {
  id: string;
  number: string;
  balance: number;
  currency: string;
  payment_type: string;
  type_name: string;
  type_group: string;
  leverage_display: string;
  is_favorite: boolean;
  created_at: string;
}

const props = defineProps<{
  clientId: string;
}>();

const appCore = useAppCore();
const { t, te, locale } = useI18n({ useScope: "global" });

const accounts = ref<AdminClientAccount[]>([]);
const page = ref(1);
const perPage = ref(10);
const totalRows = ref(0);
const isLoading = ref(false);
const searchInput = ref("");
const searchFilter = ref("");

let searchTimer: ReturnType<typeof setTimeout> | null = null;

const text = (key: string, fallback: string, params: Record<string, unknown> = {}): string =>
  te(key) ? String(t(key, params)) : fallback.replace(/\{(\w+)}/g, (_, name) => String(params[name] ?? ""));

const summaryCards = computed(() => {
  const totalBalance = accounts.value.reduce((sum, account) => sum + Number(account.balance || 0), 0);
  const favoriteCount = accounts.value.filter(account => account.is_favorite).length;

  return [
    {
      id: "total",
      label: text("admin.clients.accounts.summary.total", "Total accounts"),
      value: formatCount(totalRows.value),
      hint: text("admin.clients.accounts.summary.totalHint", "All MT accounts owned by this client"),
    },
    {
      id: "balance",
      label: text("admin.clients.accounts.summary.balance", "Visible balance"),
      value: formatMoney(totalBalance, accounts.value[0]?.currency || "USD"),
      hint: text("admin.clients.accounts.summary.balanceHint", "Sum of accounts loaded on this page"),
    },
    {
      id: "favorite",
      label: text("admin.clients.accounts.summary.favorite", "Favorites"),
      value: formatCount(favoriteCount),
      hint: text("admin.clients.accounts.summary.favoriteHint", "Favorite accounts in current page"),
    },
  ];
});

const normalizeAccount = (row: any): AdminClientAccount => ({
  id: String(row?.id ?? ""),
  number: String(row?.number ?? ""),
  balance: Number(row?.balance ?? 0),
  currency: String(row?.currency ?? "USD") || "USD",
  payment_type: String(row?.payment_type ?? ""),
  type_name: String(row?.type_name ?? ""),
  type_group: String(row?.type_group ?? ""),
  leverage_display: String(row?.leverage_display ?? row?.leverage_id ?? ""),
  is_favorite: Boolean(row?.is_favorite),
  created_at: String(row?.created_at ?? ""),
});

const formatCount = (value: number): string => new Intl.NumberFormat(locale.value || "en").format(Number(value || 0));

const formatMoney = (amount: number | string, currency = "USD"): string => {
  const numeric = Number(amount || 0);
  const normalizedCurrency = String(currency || "USD").trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat(locale.value || "en", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `${numeric.toFixed(2)} ${normalizedCurrency}`;
  }
};

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

const loadAccounts = async (): Promise<void> => {
  isLoading.value = true;

  try {
    const response = await appCore.adminModules.accounts.get({
      page: page.value,
      perPage: perPage.value,
      searchFilter: searchFilter.value,
      orderBy: "created_at",
      orderDirection: "desc",
      filters: {
        user_id: props.clientId,
      },
    });

    const payload = response?.data?.data ?? {};
    const rows = Array.isArray(payload?.data) ? payload.data : [];

    accounts.value = rows.map(normalizeAccount);
    totalRows.value = Number(payload?.total ?? rows.length);
  } finally {
    isLoading.value = false;
  }
};

const handlePaginatorPage = async (event: { page: number; rows: number }): Promise<void> => {
  page.value = Number(event.page || 0) + 1;
  perPage.value = Number(event.rows || perPage.value);
  await loadAccounts();
};

watch(searchInput, value => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }

  searchTimer = setTimeout(async () => {
    searchFilter.value = value.trim();
    page.value = 1;
    await loadAccounts();
  }, 300);
});

onMounted(loadAccounts);

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
});
</script>

<style scoped lang="scss">
.client-accounts-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
}

.client-accounts-tab__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.client-accounts-card,
.client-accounts-empty {
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

.client-accounts-card :deep(.p-card-body),
.client-accounts-card :deep(.p-card-content),
.client-accounts-empty :deep(.p-card-body),
.client-accounts-empty :deep(.p-card-content) {
  padding: 0;
}

.client-accounts-card__body {
  min-height: 104px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  padding: 13px;
}

.client-accounts-card__label,
.client-accounts-card__hint {
  color: var(--ui-text-secondary);
  font-size: 11px;
  font-weight: 720;
  line-height: 1.35;
}

.client-accounts-card__value {
  color: var(--ui-text-main);
  font-size: clamp(22px, 2vw, 32px);
  font-weight: 860;
  line-height: 1;
  letter-spacing: -0.04em;
}

.client-accounts-tab__toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.client-accounts-tab__search {
  position: relative;
  display: flex;
  align-items: center;
}

.client-accounts-tab__search > i {
  position: absolute;
  left: 14px;
  z-index: 1;
  color: var(--ui-text-secondary);
}

.client-accounts-tab__search :deep(.p-inputtext) {
  padding-left: 40px;
}

.client-accounts-tab__list {
  display: grid;
  gap: 10px;
}

.client-accounts-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 13px;
}

.client-accounts-row__main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.client-accounts-row__title {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.client-accounts-row__title > i {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  border-radius: 14px;
  color: var(--ui-primary-main);
  background: color-mix(in srgb, var(--ui-primary-main) 11%, transparent);
}

.client-accounts-row__title h3 {
  margin: 0;
  color: var(--ui-text-main);
  font-size: 16px;
  font-weight: 840;
  line-height: 1.16;
}

.client-accounts-row__title span {
  color: var(--ui-text-secondary);
  font-size: 12px;
}

.client-accounts-row__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.client-accounts-empty__body {
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

.client-accounts-empty__body .pi {
  color: var(--ui-primary-main);
  font-size: 30px;
}

.client-accounts-empty__body strong {
  color: var(--ui-text-main);
  font-size: 17px;
  font-weight: 840;
}

.client-accounts-empty__body span {
  max-width: 420px;
  font-size: 13px;
  line-height: 1.45;
}

@media (max-width: 980px) {
  .client-accounts-tab__summary {
    grid-template-columns: 1fr;
  }

  .client-accounts-row__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .client-accounts-tab {
    padding: 12px;
  }

  .client-accounts-tab__toolbar,
  .client-accounts-row__grid {
    grid-template-columns: 1fr;
  }

  .client-accounts-row__main {
    flex-direction: column;
  }
}
</style>
