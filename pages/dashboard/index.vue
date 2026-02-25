<template>
  <UiContainer>
    <div class="text-[var(--ui-text-main)]">
      <div class="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.dashboard.title") }}
        </UiTextH4>
        <div class="flex w-full items-center gap-2 sm:w-auto sm:ml-auto">
          <div class="auto-refresh-field">
            <span class="auto-refresh-field__label whitespace-nowrap">
              {{ t("cabinet.accounts.autoRefresh.label") }}
            </span>
            <UiSelect
              class="w-auto min-w-[120px] max-w-max"
              :value="autoRefreshInterval"
              :data="autoRefreshOptions"
              :withoutNoSelect="true"
              @change="handleChangeAutoRefresh"
            >
              <template #icon-left>
                <span
                  class="auto-refresh-indicator"
                  :class="{ 'is-off': !isAutoRefreshEnabled }"
                  :style="{ '--auto-refresh-progress': `${autoRefreshProgress}%` }"
                  aria-hidden="true"
                >
                  <span v-if="isAutoRefreshEnabled" class="auto-refresh-indicator__value">
                    {{ autoRefreshRemainingLabel }}
                  </span>
                  <svg
                    v-else
                    class="auto-refresh-indicator__icon"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 3v7"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M7.5 6.5a7 7 0 1 0 9 0"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>
              </template>
            </UiSelect>
          </div>
          <UiButtonDefault state="info--small" class="!w-[36px]" @click="handleManualRefresh">
            <UiIconUpdate :spinning="isMt4Refreshing" />
          </UiButtonDefault>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-5">
        <div class="dashboard-summary-grid items-stretch">
          <NuxtLink :to="localePath('/accounts')" class="dashboard-widget-link">
            <TotalAmountWidget
              class="dashboard-widget-card"
              :amount="dashboardSummary.totalAmount"
              :currency="dashboardSummary.currency"
              :is-loading="isSummaryLoading"
            />
          </NuxtLink>
          <NuxtLink :to="localePath('/referrals')" class="dashboard-widget-link">
            <ReferralTotalAmount
              class="dashboard-widget-card"
              :amount="dashboardSummary.referralTotal"
              :currency="dashboardSummary.currency"
              :is-loading="isSummaryLoading"
            />
          </NuxtLink>
          <NuxtLink :to="localePath('/payments')" class="dashboard-widget-link">
            <PendingTransactionsWidget
              class="dashboard-widget-card"
              :total="dashboardSummary.pendingTransactions"
              :is-loading="isSummaryLoading"
            />
          </NuxtLink>
          <button
            type="button"
            class="dashboard-widget-link"
            @click="handleOpenNotifications"
          >
            <MissedNotificationsWidget
              class="dashboard-widget-card"
              :total="dashboardSummary.missedNotifications"
              :is-loading="isSummaryLoading"
            />
          </button>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div class="col-span-1 flex flex-col gap-5 text-[var(--ui-text-main)]">
            <Mt4AccountsWidget
              v-if="mt4Accounts.length"
              :accounts="mt4Accounts"
              :is-loading="isMt4Refreshing"
              @toggle-favorite="toggleFavorite"
            />
            <div v-else class="rounded-xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-sm text-[var(--ui-text-secondary)]">
              {{ t("cabinet.dashboard.mt4.empty") }}
            </div>
          </div>

          <div class="col-span-1 flex flex-col gap-3 text-[var(--ui-text-main)]">
            <AccountVerificationWidget />
          </div>
        </div>

        <div class="col-span-1">
          <TransactionsWidget />
        </div>
      </div>
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta, useLocalePath } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useNuxtApp } from "nuxt/app";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconUpdate from "~/components/ui/UiIconUpdate.vue";

import TransactionsWidget from "~/components/block/widgets/TransactionsWidget.vue";
import TotalAmountWidget from "~/components/block/widgets/TotalAmountWidget.vue";
import PendingTransactionsWidget from "~/components/block/widgets/PendingTransactionsWidget.vue";
import MissedNotificationsWidget from "~/components/block/widgets/MissedNotificationsWidget.vue";
import ReferralTotalAmount from "~/components/block/widgets/ReferralTotalAmount.vue";
import AccountVerificationWidget from "~/components/block/widgets/AccountVerificationWidget.vue";
import Mt4AccountsWidget from "~/components/block/widgets/Mt4AccountsWidget.vue";
import { useUiStore } from "~/stores/uiStore";
import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { $echo } = useNuxtApp();
const localePath = useLocalePath();
const uiStore = useUiStore();
const appCore = useAppCore();
let mt4RefreshTimer: ReturnType<typeof setInterval> | null = null;

type DashboardSummary = {
  totalAmount: number;
  pendingTransactions: number;
  missedNotifications: number;
  referralTotal: number;
  currency: string;
};

const dashboardSummary = ref<DashboardSummary>({
  totalAmount: 0,
  pendingTransactions: 0,
  missedNotifications: 0,
  referralTotal: 0,
  currency: "USD",
});
const isSummaryLoading = ref(false);

const AUTO_REFRESH_STORAGE_KEY = "dashboardAutoRefreshInterval";
const DEFAULT_REFRESH_SECONDS = "20";
const autoRefreshInterval = ref(DEFAULT_REFRESH_SECONDS);
const autoRefreshRemaining = ref(0);
const autoRefreshProgressValue = ref(0);
let nextRefreshAt: number | null = null;

const autoRefreshOptions = computed(() => {
  const secondsShort = t("cabinet.accounts.autoRefresh.secondsShort");
  return [
    { id: "off", value: "0", text: t("cabinet.accounts.autoRefresh.off") },
    { id: "2", value: "2", text: `2${secondsShort}` },
    { id: "3", value: "3", text: `3${secondsShort}` },
    { id: "5", value: "5", text: `5${secondsShort}` },
    { id: "10", value: "10", text: `10${secondsShort}` },
    { id: "15", value: "15", text: `15${secondsShort}` },
    { id: "20", value: "20", text: `20${secondsShort}` },
    { id: "30", value: "30", text: `30${secondsShort}` },
    { id: "60", value: "60", text: `60${secondsShort}` },
  ];
});

const isAutoRefreshEnabled = computed(() => Number(autoRefreshInterval.value) > 0);
const autoRefreshRemainingLabel = computed(() => {
  if (!isAutoRefreshEnabled.value) return t("cabinet.accounts.autoRefresh.offShort");
  return `${autoRefreshRemaining.value}${t("cabinet.accounts.autoRefresh.secondsShort")}`;
});
const autoRefreshProgress = computed(() => {
  if (!isAutoRefreshEnabled.value) return 0;
  return Math.min(100, Math.max(0, autoRefreshProgressValue.value));
});

const clearAutoRefresh = () => {
  if (!mt4RefreshTimer) return;
  clearInterval(mt4RefreshTimer);
  mt4RefreshTimer = null;
  nextRefreshAt = null;
  autoRefreshProgressValue.value = 0;
};

const setupAutoRefresh = () => {
  clearAutoRefresh();
  const seconds = Number(autoRefreshInterval.value);
  if (!seconds || Number.isNaN(seconds)) {
    autoRefreshRemaining.value = 0;
    return;
  }

  const totalMs = seconds * 1000;
  nextRefreshAt = Date.now() + totalMs;
  autoRefreshRemaining.value = seconds;
  autoRefreshProgressValue.value = 0;

  mt4RefreshTimer = setInterval(() => {
    if (!nextRefreshAt) return;
    const now = Date.now();
    const remainingMs = nextRefreshAt - now;
    const clampedRemainingMs = Math.max(0, remainingMs);
    autoRefreshRemaining.value = Math.max(0, Math.ceil(clampedRemainingMs / 1000));
    autoRefreshProgressValue.value = ((totalMs - clampedRemainingMs) / totalMs) * 100;

    if (remainingMs <= 0) {
      handleRefreshDashboard();
      nextRefreshAt = Date.now() + totalMs;
      autoRefreshRemaining.value = seconds;
      autoRefreshProgressValue.value = 0;
    }
  }, 100);
};

const handleChangeAutoRefresh = (value: string | null) => {
  if (!value) return;
  autoRefreshInterval.value = value;
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, value);
  setupAutoRefresh();
};

const initAutoRefresh = () => {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(AUTO_REFRESH_STORAGE_KEY);
  const isValid = !!autoRefreshOptions.value.find((option) => option.value === saved);
  autoRefreshInterval.value = isValid ? (saved as string) : DEFAULT_REFRESH_SECONDS;
  localStorage.setItem(AUTO_REFRESH_STORAGE_KEY, autoRefreshInterval.value);
  setupAutoRefresh();
};

onMounted(async () => {
  // @ts-ignore
  const sub = (window as any).Echo?.channel("test") ?? $echo.channel("test");
  sub.listen(".Ping", (e: any) => {
    console.log("[TEST] Ping received:", e);
  });

  await handleRefreshDashboard();
  initAutoRefresh();
});

onBeforeUnmount(() => {
  try {
    // @ts-ignore
    $echo.leave("test");
  } catch {}
  clearAutoRefresh();
});

type Mt4Status = "active" | "inactive";

type Mt4Account = {
  id: string;
  type: string;
  leverage: string;
  currency: string;
  balance: number;
  status: Mt4Status;
  is_favorite: boolean;
  favorite_at?: string | null;
};

const mt4Accounts = ref<Mt4Account[]>([]);

const MAX_FAVORITES = 3;

const sortAccounts = (items: Mt4Account[]) =>
  [...items].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1;
    return (b.balance ?? 0) - (a.balance ?? 0);
  });

const applyFavoriteLimit = (items: Mt4Account[], selectedId: string) => {
  const favorites = items
    .filter((account) => account.is_favorite)
    .sort((a, b) => {
      const aTime = a.favorite_at ? new Date(a.favorite_at).getTime() : 0;
      const bTime = b.favorite_at ? new Date(b.favorite_at).getTime() : 0;
      return aTime - bTime;
    });
  if (favorites.length <= MAX_FAVORITES) return items;
  const toRemove = favorites.find((fav) => fav.id !== selectedId) ?? favorites[0];
  return items.map((account) =>
    account.id === toRemove.id ? { ...account, is_favorite: false, favorite_at: null } : account,
  );
};

const toggleFavorite = async (id: string) => {
  const current = mt4Accounts.value.find((account) => account.id === id);
  if (!current) return;
  const isAdding = !current.is_favorite;
  const now = new Date().toISOString();
  let optimistic = mt4Accounts.value.map((account) =>
    account.id === id
      ? { ...account, is_favorite: isAdding, favorite_at: isAdding ? now : null }
      : account,
  );
  if (isAdding) {
    optimistic = applyFavoriteLimit(optimistic, id);
  }
  mt4Accounts.value = sortAccounts(optimistic);

  try {
    const response = await appCore.accounts.toggleFavorite(id);
    const payload = response?.data?.data ?? {};
    const updated = payload.account;
    const removedId = payload.removed_favorite_id;
    if (updated?.id) {
      mt4Accounts.value = mt4Accounts.value.map((account) =>
        account.id === updated.id
          ? { ...account, is_favorite: !!updated.is_favorite, favorite_at: updated.favorite_at ?? null }
          : account,
      );
    }
    if (removedId) {
      mt4Accounts.value = mt4Accounts.value.map((account) =>
        account.id === removedId ? { ...account, is_favorite: false, favorite_at: null } : account,
      );
    }
    mt4Accounts.value = sortAccounts(mt4Accounts.value);
  } catch {
    handleRefreshMt4();
  }
};
const isMt4Refreshing = ref(false);
const handleRefreshSummary = async () => {
  if (isSummaryLoading.value) return;

  isSummaryLoading.value = true;
  try {
    const response = await appCore.dashboard.getSummary();
    const payload = response?.data?.data ?? {};
    dashboardSummary.value = {
      totalAmount: Number(payload.total_amount ?? 0),
      pendingTransactions: Number(payload.pending_transactions ?? 0),
      missedNotifications: Number(payload.missed_notifications ?? 0),
      referralTotal: Number(payload.referral_total ?? 0),
      currency: String(payload.currency ?? "USD"),
    };
  } catch {}
  finally {
    isSummaryLoading.value = false;
  }
};

const handleRefreshMt4 = async () => {
  if (isMt4Refreshing.value) return;
  isMt4Refreshing.value = true;
  try {
    const response = await appCore.accounts.get({
      page: 1,
      perPage: 100,
      orderBy: "balance",
      orderDirection: "desc",
    });
    const items = response?.data?.data?.data ?? [];
    const mapped = items.map((account: any) => ({
      id: account.id,
      type: account.account_type?.name ?? account.accountType?.name ?? "-",
      leverage: account.leverage ?? "1:50",
      currency: account.currency ?? "USD",
      balance: Number(account.balance ?? 0),
      status: account.status ?? "active",
      is_favorite: !!account.is_favorite,
      favorite_at: account.favorite_at ?? null,
    }));
    mt4Accounts.value = sortAccounts(mapped);
  } finally {
    setTimeout(() => {
      isMt4Refreshing.value = false;
    }, 400);
  }
};

const handleRefreshDashboard = async () => {
  try {
    await Promise.all([handleRefreshMt4(), handleRefreshSummary()]);
  } finally {
    useEventBus.emit("dashboardRefresh");
  }
};

const handleOpenNotifications = () => {
  uiStore.openNotifications();
};

const handleManualRefresh = () => {
  handleRefreshDashboard();
};

</script>

<style scoped>
.row-item {
  background: var(--color-stroke-ui-dark);
  border-bottom: 1px solid var(--color-stroke-ui-light);
  border-radius: 6px;
  padding: 12px;
  transition: opacity 0.2s ease;
}

.row-item:hover {
  opacity: 0.85;
}

.dashboard-widget-link {
  display: block;
  background: transparent;
  border: 0;
  padding: 0;
  text-align: left;
  width: 100%;
}

.dashboard-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .dashboard-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1440px) {
  .dashboard-summary-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.dashboard-widget-link :deep(.dashboard-widget-card) {
  height: 100%;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.dashboard-widget-link:hover :deep(.dashboard-widget-card) {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
  opacity: 0.95;
}

.auto-refresh-indicator {
  --auto-refresh-progress: 0%;
  height: 26px;
  width: 26px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: conic-gradient(
    var(--ui-primary-accent) var(--auto-refresh-progress),
    var(--color-stroke-ui-light) 0
  );
  color: var(--ui-text-main);
  font-size: 10px;
  line-height: 1;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.auto-refresh-indicator.is-off {
  background: var(--color-stroke-ui-light);
  color: var(--ui-text-secondary);
}

.auto-refresh-indicator__value {
  display: block;
  max-width: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  transform: translateY(0.5px);
}

.auto-refresh-indicator__icon {
  width: 14px;
  height: 14px;
}

.auto-refresh-field {
  position: relative;
  display: inline-flex;
  width: auto;
  background-color: var(--color-stroke-ui-dark);
  border: 1px solid var(--color-stroke-ui-light);
  border-radius: 10px;
  padding: 6px;
}

.auto-refresh-field :deep(.select) {
  border: none;
  background: transparent;
  height: 32px;
  padding-left: 6px;
  padding-right: 2px;
  width: auto;
  white-space: nowrap;
}

.auto-refresh-field__label {
  position: absolute;
  top: -8px;
  left: 10px;
  background: var(--ui-background);
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  color: var(--ui-text-secondary);
}

/* MT4 and verification styles moved into widgets */
</style>
