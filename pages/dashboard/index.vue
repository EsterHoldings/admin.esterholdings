<template>
  <UiContainer>
    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center text-[var(--ui-text-main)]">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>
    <template v-else>
      <div class="text-[var(--ui-text-main)]">
        <div class="mb-6">
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.dashboard.title") }}
          </UiTextH4>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- LEFT COLUMN: widgets + MT4 -->
        <div class="col-span-1 flex flex-col gap-5 text-[var(--ui-text-main)]">
          <!-- 4 widgets -->
          <div class="grid grid-cols-2 items-stretch gap-2">
            <TotalAmountWidget />
            <PendingTransactionsWidget />
            <MissedNotificationsWidget />
            <ReferralTotalAmount />
          </div>

          <!-- MT4 accounts as cards -->
          <div class="flex flex-col gap-4 mt-4">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div class="text-[18px] font-semibold">
                {{ t("cabinet.dashboard.mt4.title") }}
              </div>

              <NuxtLink to="/accounts" class="w-full sm:w-auto">
                <UiButtonDefault state="primary" class="w-full sm:w-auto">
                  {{ t("cabinet.dashboard.mt4.openNewAccount") }}
                </UiButtonDefault>
              </NuxtLink>
            </div>

            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="account in mt4Accounts"
                :key="account.id"
                class="mt4-card verification-item mt4-grid"
              >
                <button
                  class="mt4-star flex h-8 w-8 items-center justify-center rounded-md transition text-[var(--ui-text-secondary)]"
                  type="button"
                  :aria-pressed="account.favorite"
                  :title="account.favorite ? 'Remove from favorites' : 'Add to favorites'"
                  @click="toggleFavorite(account.id)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    :fill="account.favorite ? 'var(--ui-primary-accent)' : 'none'"
                    :stroke="account.favorite ? 'var(--ui-primary-accent)' : 'var(--ui-text-secondary)'"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
                <div class="mt4-type min-w-0 text-[var(--ui-text-main)]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.type") }}
                  </UiTextSmall>
                  <div class="truncate font-semibold">{{ account.type }}</div>
                  <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">
                    {{ t("cabinet.accounts.columns.leverage") }}: {{ account.leverage }}
                  </UiTextSmall>
                </div>
                <div class="mt4-account min-w-0 text-[var(--ui-text-main)]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.account") }}
                  </UiTextSmall>
                  <UiTextSmall class="text-[var(--ui-text-main)] font-semibold truncate">MT4 {{ account.id }}</UiTextSmall>
                </div>
                <div class="mt4-balance min-w-0 text-[var(--ui-text-main)]">
                  <UiTextSmall class="text-[var(--ui-text-secondary)]">
                    {{ t("cabinet.dashboard.mt4.table.balance") }}
                  </UiTextSmall>
                  <div class="truncate font-semibold">
                    {{ account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    {{ account.currency }}
                  </div>
                </div>
                <UiBadge :state="mt4BadgeState(account.status)" outline class="mt4-badge border text-xs !px-3 !py-1 bg-[var(--color-stroke-ui-dark)]">
                  {{ statusText[account.status]() }}
                </UiBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: verification -->
        <div class="col-span-1 flex flex-col gap-3 text-[var(--ui-text-main)] mt-5 lg:mt-0">
          <div class="flex flex-col gap-3">
            <div class="flex flex-col gap-3 rounded-xl bg-[var(--color-stroke-ui-dark)]/70 sm:flex-row sm:items-center sm:justify-between">
              <div class="space-y-1">
                <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
                  {{ t("cabinet.dashboard.accountVerification.title") }}
                </div>
                <div class="text-sm text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.dashboard.accountVerification.subtitle") }}
                </div>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex flex-col text-right">
                  <UiTextH5 class="justify-end text-[var(--ui-text-main)]">Родіон Максименко</UiTextH5>
                  <UiTextParagraph class="justify-end">
                    <strong>test@gmail.com</strong>
                  </UiTextParagraph>
                  <UiTextSmall class="justify-end">{{ '10.05.1993' }}</UiTextSmall>
                </div>

                <NuxtLink to="/profile" class="shrink-0">
                  <UiImageCircle :twoChars="'TU'" :src="''" />
                </NuxtLink>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div
                v-for="item in verificationSteps"
                :key="item.key"
                class="verification-item"
              >
                <div class="flex items-start gap-3 sm:items-center">
                  <div class="step-icon" :class="item.state">
                    <component :is="item.icon" class="h-4 w-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                      <span class="text-sm font-semibold text-[var(--ui-text-main)] truncate" :title="item.title">
                        {{ item.title }}
                      </span>
                      <UiBadge :state="badgeState(item.state)" outline class="!py-0.5 !px-2 text-xs">
                        {{ item.statusLabel }}
                      </UiBadge>
                    </div>
                    <UiTextSmall class="text-[var(--ui-text-secondary)] leading-snug">
                      {{ item.statusText }}
                    </UiTextSmall>
                    <UiTextSmall v-if="item.hint" class="text-[var(--ui-primary-accent)] mt-1 leading-snug">
                      {{ item.hint }}
                    </UiTextSmall>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- FULL WIDTH: transactions -->
          <div class="col-span-1 lg:col-span-2">
            <TransactionsWidget />
          </div>
        </div>
      </div>
    </template>
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { onBeforeUnmount, onMounted, ref, nextTick } from "vue";
import { useNuxtApp } from "nuxt/app";

import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";

import UiIconSuccess from "~/components/ui/UiIconSuccess.vue";
import UiIconFailed from "~/components/ui/UiIconFailed.vue";

import TransactionsWidget from "~/components/block/widgets/TransactionsWidget.vue";
import TotalAmountWidget from "~/components/block/widgets/TotalAmountWidget.vue";
import PendingTransactionsWidget from "~/components/block/widgets/PendingTransactionsWidget.vue";
import MissedNotificationsWidget from "~/components/block/widgets/MissedNotificationsWidget.vue";
import ReferralTotalAmount from "~/components/block/widgets/ReferralTotalAmount.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiTextH5 from "~/components/ui/UiTextH5.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";
import UiIconWarning from "~/components/ui/UiIconWarning.vue";
import UiBadge from "~/components/ui/UiBadge.vue";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { $echo } = useNuxtApp();
const isInitialLoading = ref(true);

onMounted(() => {
  // @ts-ignore
  const sub = (window as any).Echo?.channel("test") ?? $echo.channel("test");
  sub.listen(".Ping", (e: any) => {
    console.log("[TEST] Ping received:", e);
  });

  nextTick(() => {
    isInitialLoading.value = false;
  });
});

onBeforeUnmount(() => {
  try {
    // @ts-ignore
    $echo.leave("test");
  } catch {}
});

type Mt4Status = "active" | "inactive";

type Mt4Account = {
  id: string;
  type: string;
  leverage: string;
  currency: string;
  balance: number;
  status: Mt4Status;
  favorite: boolean;
};

const mt4Accounts = ref<Mt4Account[]>([
  {
    id: "45003210",
    type: "Raw Spread",
    leverage: "1:500",
    currency: "USD",
    balance: 12450.75,
    status: "active",
    favorite: true,
  },
  {
    id: "45008765",
    type: "Standard",
    leverage: "1:200",
    currency: "EUR",
    balance: 5420.1,
    status: "active",
    favorite: false,
  },
  {
    id: "45009934",
    type: "Pro",
    leverage: "1:100",
    currency: "USD",
    balance: 2150.0,
    status: "inactive",
    favorite: false,
  },
]);

const statusText = {
  active: () => t("cabinet.dashboard.mt4.table.active"),
  inactive: () => t("cabinet.dashboard.mt4.table.inactive"),
};

const toggleFavorite = (id: string) => {
  mt4Accounts.value = mt4Accounts.value.map((account) =>
    account.id === id ? { ...account, favorite: !account.favorite } : account,
  );
};

const mt4BadgeState = (status: Mt4Status) => {
  return status === "active" ? "success" : "warning";
};

const verificationSteps = [
  {
    key: "photo",
    title: "Фото користувача",
    statusText: t("cabinet.dashboard.accountVerification.profilePhoto"),
    statusLabel: t("cabinet.dashboard.accountVerification.statuses.required") || "Потрібно",
    hint: "Загрузите фото пользователя, система в скоро времени проведет автоматическую ферификацию!",
    icon: UiIconFailed,
    state: "error",
  },
  {
    key: "profile",
    title: "Дані користувача",
    statusText: t("cabinet.dashboard.accountVerification.profileInProgress"),
    statusLabel: t("cabinet.dashboard.accountVerification.statuses.inProgress") || "В процесі",
    hint: "Заповніть персональні дані в профілі — після цього система автоматично продовжить верифікацію.",
    icon: UiIconWarning,
    state: "warn",
  },
  {
    key: "email",
    title: "Верифікація пошти",
    statusText: t("cabinet.dashboard.accountVerification.profileInProgress"),
    statusLabel: t("cabinet.dashboard.accountVerification.statuses.inProgress") || "В процесі",
    hint: "Підтвердіть email через лист — інколи він потрапляє в «Спам» або «Промоакції».",
    icon: UiIconWarning,
    state: "warn",
  },
  {
    key: "docs",
    title: "Документи",
    statusText: t("cabinet.dashboard.accountVerification.documentVerified"),
    statusLabel: t("cabinet.dashboard.accountVerification.statuses.done") || "Готово",
    hint: "",
    icon: UiIconSuccess,
    state: "success",
  },
  {
    key: "deposit",
    title: "1-й депозит",
    statusText: t("cabinet.dashboard.accountVerification.paymentInProgress"),
    statusLabel: t("cabinet.dashboard.accountVerification.statuses.inProgress") || "В процесі",
    hint: "Зробіть перший депозит — після зарахування система автоматично оновить статус.",
    icon: UiIconWarning,
    state: "warn",
  },
];

const badgeState = (state: "warn" | "error" | "success") => {
  if (state === "success") return "success";
  if (state === "error") return "danger";
  return "warning";
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

.mt4-card {
  background: transparent;
  border-radius: 8px;
  padding: 12px;
  transition: background-color 0.2s ease, opacity 0.2s ease;
}

.mt4-card:hover {
  background: var(--ui-background-card);
  opacity: 0.95;
}

.mt4-grid {
  display: grid;
  grid-template-columns: 44px repeat(3, minmax(0, 1fr)) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  grid-template-areas: "star type account balance badge";
}

.mt4-grid > * {
  min-width: 0;
}

.mt4-star {
  grid-area: star;
}
.mt4-star:hover {
  background: var(--ui-background-card);
}
.mt4-type {
  grid-area: type;
}
.mt4-account {
  grid-area: account;
}
.mt4-balance {
  grid-area: balance;
}
.mt4-badge {
  grid-area: badge;
  justify-self: end;
}

@media (max-width: 767px) {
  .mt4-grid {
    grid-template-columns: 44px 1fr 1fr;
    grid-template-areas:
      "star type badge"
      "star account badge"
      "star balance badge";
    gap: 10px 12px;
    align-items: start;
  }
}

.verification-item {
  border-radius: 12px;
  background: var(--ui-background-panel);
  border: 1px solid var(--color-stroke-ui-light);
  padding: 14px 16px;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.verification-item:hover {
  background: var(--ui-background-card);
  border-color: var(--color-stroke-ui-light);
}

.step-icon {
  height: 32px;
  width: 32px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: var(--ui-background-card);
}

.step-icon.warn {
  color: var(--color-ui-warning);
}
.step-icon.error {
  color: var(--color-danger);
}
.step-icon.success {
  color: var(--color-success);
}
</style>
