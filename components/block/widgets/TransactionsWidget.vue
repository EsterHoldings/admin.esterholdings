<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLocalePath } from "~/.nuxt/imports";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";

import useAppCore from "~/composables/useAppCore";
import useEventBus from "~/composables/useEventBus";

const { t } = useI18n({ useScope: "global" });
const localePath = useLocalePath();
const appCore = useAppCore();

const payments = reactive<any[]>([]);
const isLoading = ref(false);
const errorMsg = ref<string | null>(null);

const paymentsPageLink = computed(() => localePath("/payments"));
const newDepositLink = computed(() => `${paymentsPageLink.value}?openDeposit=1`);
const newWithdrawalLink = computed(() => `${paymentsPageLink.value}?openWithdrawal=1`);

const statusKey = (status: unknown): string => String(status ?? "").trim().toLowerCase();

const isPendingStatus = (status: string): boolean => {
  return ["pending", "processing", "in_progress", "in-progress"].includes(status);
};

const isSuccessStatus = (status: string): boolean => {
  return ["success", "approved", "completed", "done"].includes(status);
};

const isFailedStatus = (status: string): boolean => {
  return ["failed", "rejected", "cancelled", "error"].includes(status);
};

const getTimestamp = (value: unknown): number => {
  const timestamp = new Date(String(value ?? "")).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const displayedPayments = computed(() => {
  const rows = [...payments];

  rows.sort((a, b) => {
    const aPending = isPendingStatus(statusKey(a?.status));
    const bPending = isPendingStatus(statusKey(b?.status));

    if (aPending !== bPending) {
      return aPending ? -1 : 1;
    }

    return getTimestamp(b?.created_at) - getTimestamp(a?.created_at);
  });

  return rows.slice(0, 5);
});

const amountClass = (payment: any) => {
  const type = String(payment?.type ?? "").toLowerCase();

  if (["withdraw", "withdrawal", "виплата", "вывод", "payout"].includes(type)) {
    return "text-[var(--ui-sticker-danger)]";
  }

  if (["deposit", "поповнення", "пополнение", "topup"].includes(type)) {
    return "text-[var(--ui-sticker-success)]";
  }

  return "text-[var(--ui-text-main)]";
};

const statusClass = (status: unknown) => {
  const normalized = statusKey(status);

  return {
    "transaction-status--pending": isPendingStatus(normalized),
    "transaction-status--success": isSuccessStatus(normalized),
    "transaction-status--failed": isFailedStatus(normalized),
    "transaction-status--default":
      !isPendingStatus(normalized) && !isSuccessStatus(normalized) && !isFailedStatus(normalized),
  };
};

const loadPaymentsData = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  errorMsg.value = null;

  try {
    const response = await appCore.payments.get({
      perPage: 100,
      page: 1,
      orderBy: "created_at",
      orderDirection: "desc",
    });

    const payload = response?.data?.data;
    const rows = Array.isArray(payload?.data) ? payload.data : [];

    payments.splice(0, payments.length, ...rows);
  } catch (error: any) {
    errorMsg.value = error?.message ?? t("cabinet.dashboard.transactions.errorLoad");
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadPaymentsData();
  useEventBus.on("dashboardRefresh", loadPaymentsData);
});

onBeforeUnmount(() => {
  useEventBus.off("dashboardRefresh", loadPaymentsData);
});
</script>

<template>
  <PanelDefault>
    <div class="transactions-widget">
      <div class="transactions-widget__header">
        <UiTextH5 class="!text-[var(--ui-text-main)]">{{ t("cabinet.dashboard.transactions.title") }}</UiTextH5>

        <div class="transactions-widget__actions">
          <NuxtLink :to="newDepositLink" class="shrink-0">
            <UiButtonDefault state="success">{{ t("cabinet.dashboard.actions.newDeposit") }}</UiButtonDefault>
          </NuxtLink>

          <NuxtLink :to="newWithdrawalLink" class="shrink-0">
            <UiButtonDefault state="info--outline">{{ t("cabinet.dashboard.actions.newWithdrawal") }}</UiButtonDefault>
          </NuxtLink>
        </div>
      </div>

      <div class="transactions-widget__body">
        <div v-if="isLoading" class="transactions-widget__loading">
          <UiIconSpinnerDefault />
        </div>

        <div v-else-if="errorMsg" class="transactions-widget__error">
          {{ errorMsg }}
        </div>

        <div v-else-if="displayedPayments.length === 0" class="transactions-widget__empty">
          <UiTextH5>{{ t("cabinet.dashboard.transactions.empty") }}</UiTextH5>
        </div>

        <div v-else class="transactions-list">
          <NuxtLink
            v-for="(payment, index) in displayedPayments"
            :key="payment.id || index"
            :to="paymentsPageLink"
            class="transaction-row">
            <div class="hidden md:grid transaction-row__desktop">
              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.accountNumber") }}</div>
                <div class="transaction-value truncate" :title="payment.account_number">{{ payment.account_number }}</div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                <div class="transaction-value font-semibold tabular-nums" :class="amountClass(payment)">{{ payment.amount }}</div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                <div class="transaction-value uppercase tracking-wide">{{ payment.currency }}</div>
              </div>

              <div class="min-w-0">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.type") }}</div>
                <div class="transaction-value capitalize truncate" :title="payment.type">{{ payment.type }}</div>
              </div>

              <div class="min-w-0 text-right">
                <div class="transaction-label">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                <UiTextSmall class="transaction-value tabular-nums truncate" :title="payment.created_at">
                  {{ payment.created_at }}
                </UiTextSmall>
              </div>

              <div class="justify-self-end">
                <span class="transaction-status" :class="statusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </div>
            </div>

            <div class="md:hidden flex flex-col gap-[10px]">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.accountNumber") }}</div>
                  <div class="transaction-value truncate" :title="payment.account_number">{{ payment.account_number }}</div>
                </div>
                <span class="transaction-status" :class="statusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </div>

              <div class="transaction-row__mobile-grid">
                <div>
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.amount") }}</div>
                  <div class="transaction-value font-semibold tabular-nums" :class="amountClass(payment)">{{ payment.amount }}</div>
                </div>
                <div class="text-right">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.currency") }}</div>
                  <div class="transaction-value uppercase tracking-wide">{{ payment.currency }}</div>
                </div>
              </div>

              <div class="transaction-row__mobile-grid transaction-row__mobile-grid--bordered">
                <div>
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.type") }}</div>
                  <div class="transaction-value capitalize truncate" :title="payment.type">{{ payment.type }}</div>
                </div>
                <div class="text-right">
                  <div class="transaction-label">{{ t("cabinet.dashboard.transactions.createdAt") }}</div>
                  <div class="transaction-value tabular-nums truncate" :title="payment.created_at">{{ payment.created_at }}</div>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </PanelDefault>
</template>

<style scoped>
.transactions-widget {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transactions-widget__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.transactions-widget__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.transactions-widget__body {
  position: relative;
  min-height: 160px;
}

.transactions-widget__loading,
.transactions-widget__error,
.transactions-widget__empty {
  min-height: 160px;
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  text-align: center;
}

.transactions-widget__error {
  color: var(--ui-sticker-danger);
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.transaction-row {
  display: block;
  border-radius: 12px;
  border: 1px solid var(--color-stroke-ui-light);
  background: var(--ui-background-panel);
  padding: 12px 14px;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.transaction-row:hover {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
  opacity: 0.95;
}

.transaction-row__desktop {
  grid-template-columns: 1.2fr 0.9fr 0.8fr 0.9fr 1fr auto;
  gap: 10px;
  align-items: center;
}

.transaction-row__mobile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.transaction-row__mobile-grid--bordered {
  border-top: 1px solid var(--color-stroke-ui-light);
  padding-top: 10px;
}

.transaction-label {
  font-size: 11px;
  color: var(--ui-text-secondary);
}

.transaction-value {
  color: var(--ui-text-main);
}

.transaction-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;
  white-space: nowrap;
}

.transaction-status--pending {
  color: var(--ui-sticker-warning);
  border-color: rgba(245, 158, 11, 0.45);
  background: rgba(245, 158, 11, 0.14);
}

.transaction-status--success {
  color: var(--ui-sticker-success);
  border-color: rgba(16, 185, 129, 0.45);
  background: rgba(16, 185, 129, 0.14);
}

.transaction-status--failed {
  color: var(--ui-sticker-danger);
  border-color: rgba(239, 68, 68, 0.45);
  background: rgba(239, 68, 68, 0.14);
}

.transaction-status--default {
  color: var(--ui-text-secondary);
  border-color: var(--color-stroke-ui-light);
  background: transparent;
}

@media (max-width: 767px) {
  .transactions-widget__actions {
    width: 100%;
  }

  .transactions-widget__actions :deep(.button-default) {
    width: 100%;
  }
}
</style>
