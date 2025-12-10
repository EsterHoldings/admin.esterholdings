<template>
  <UiContainer>
    <template v-if="isInitialLoading">
      <div class="flex min-h-[55vh] w-full flex-col items-center justify-center text-white">
        <UiIconLogo class="mb-4 h-[44px] w-[44px]" />
        <UiIconSpinnerDefault class="h-[44px] w-[44px]" />
      </div>
    </template>
    <template v-else>
      <div class="text-white">
        <div class="mb-6">
          <UiTextH4 class="text-[var(--ui-text-main)]">
            {{ t("cabinet.dashboard.title") }}
          </UiTextH4>
        </div>

        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- LEFT COLUMN: widgets + MT4 -->
        <div class="col-span-1 flex flex-col gap-5 text-[var(--ui-text-main)]">
          <!-- 4 widgets -->
          <div class="grid grid-cols-1 items-stretch gap-2 sm:grid-cols-2">
            <TotalAmountWidget />
            <PendingTransactionsWidget />
            <MissedNotificationsWidget />
            <ReferralTotalAmount />
          </div>

          <!-- MT4 accounts as cards -->
          <PanelDefault>
            <div class="rounded-2xl p-2 sm:p-3">
              <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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
                  class="mt4-card"
                >
                  <div class="flex flex-wrap items-center gap-4 text-sm sm:flex-nowrap sm:gap-5">
                    <button
                      type="button"
                      class="flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[var(--ui-background-panel)] text-[var(--ui-text-secondary)]"
                      :aria-pressed="account.favorite"
                      :title="account.favorite ? 'Remove from favorites' : 'Add to favorites'"
                      @click="toggleFavorite(account.id)"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        class="h-4 w-4"
                        :fill="account.favorite ? '#f5c542' : 'none'"
                        :stroke="account.favorite ? '#f5c542' : 'var(--ui-text-secondary)'"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                    <div class="min-w-0 text-[var(--ui-text-main)]">
                      <UiTextSmall class="text-[var(--ui-text-secondary)]">
                        {{ t("cabinet.dashboard.mt4.table.type") }}
                      </UiTextSmall>
                      <div class="truncate font-semibold">{{ account.type }}</div>
                      <UiTextSmall class="text-[var(--ui-text-secondary)] truncate">
                        {{ t("cabinet.accounts.columns.leverage") }}: {{ account.leverage }}
                      </UiTextSmall>
                    </div>
                    <div class="min-w-0 text-[var(--ui-text-main)]">
                      <UiTextSmall class="text-[var(--ui-text-secondary)]">
                        {{ t("cabinet.dashboard.mt4.table.account") }}
                      </UiTextSmall>
                      <UiTextSmall class="text-[var(--ui-text-main)] font-semibold truncate">MT4 {{ account.id }}</UiTextSmall>
                    </div>
                    <div class="min-w-0 text-[var(--ui-text-main)]">
                      <UiTextSmall class="text-[var(--ui-text-secondary)]">
                        {{ t("cabinet.dashboard.mt4.table.balance") }}
                      </UiTextSmall>
                      <div class="truncate font-semibold">
                        {{ account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                        {{ account.currency }}
                      </div>
                    </div>
                    <UiTextSmall class="shrink-0 text-[var(--ui-text-secondary)]">
                      {{ statusText[account.status]() }}
                    </UiTextSmall>
                  </div>
                </div>
              </div>
            </div>
          </PanelDefault>
        </div>

        <!-- RIGHT COLUMN: verification -->
        <PanelDefault class="col-span-1 text-[var(--ui-text-main)]">
          <div class="rounded-2xl p-2 sm:p-3">
            <div class="mb-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
                  {{ t("cabinet.dashboard.accountVerification.title") }}
                </div>
                <div class="text-sm text-[var(--ui-text-secondary)]">
                  {{ t("cabinet.dashboard.accountVerification.subtitle") }}
                </div>
              </div>

              <div class="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                <div class="flex flex-col text-left sm:mr-3 sm:text-right">
                  <UiTextH5 class="flex items-center justify-start sm:justify-end">Родіон Максименко</UiTextH5>
                  <UiTextParagraph class="flex items-center justify-start sm:justify-end">
                    <strong>test@gmail.com</strong>
                  </UiTextParagraph>
                  <UiTextSmall class="flex items-center justify-start sm:justify-end">10.05.1993</UiTextSmall>
                </div>

                <NuxtLink to="/profile" class="shrink-0">
                  <UiImageCircle :twoChars="'TU'" :src="''" />
                </NuxtLink>
              </div>
            </div>

            <ul class="mt-5 list-none p-0 text-sm text-[var(--ui-text-secondary)]">
              <li
                  class="mb-2 rounded-sm border-b border-b-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-3 hover:opacity-75 sm:p-3"
              >
                <div class="flex min-h-[35px] items-start gap-3 sm:items-center">
                  <span class="w-24 shrink-0 cursor-pointer truncate sm:w-28" title="Фото користувача">
                    Фото користувача
                  </span>
                  <UiIconFailed />
                  <span class="flex-1 min-w-0 leading-snug sm:ml-5 sm:truncate">
                    {{ t("cabinet.dashboard.accountVerification.profilePhoto") }}
                  </span>
                </div>
                <UiTextSmall class="mb-2 !text-[var(--ui-primary-accent)]">
                  Загрузите фото пользователя, система в скоро времени проведет автоматическую ферификацию!
                </UiTextSmall>
              </li>

              <li
                  class="mb-2 rounded-sm border-b border-b-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-2 hover:opacity-75 sm:p-3"
              >
                <div class="flex min-h-[35px] items-start gap-3 pb-2 sm:items-center sm:pb-3">
                  <span class="w-24 shrink-0 cursor-pointer truncate sm:w-28" title="Дані користувача">
                    Дані користувача
                  </span>
                  <UiIconWarning />
                  <span class="flex-1 min-w-0 leading-snug sm:ml-5 sm:truncate">
                    {{ t("cabinet.dashboard.accountVerification.profileInProgress") }}
                  </span>
                </div>
                <UiTextSmall class="mb-2 !text-[var(--ui-primary-accent)]">
                  Заповніть персональні дані в профілі — після цього система автоматично продовжить верифікацію.
                </UiTextSmall>
              </li>

              <li
                  class="mb-2 rounded-sm border-b border-b-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-2 hover:opacity-75 sm:p-3"
              >
                <div class="flex min-h-[35px] items-start gap-3 pb-2 sm:items-center sm:pb-3">
                  <span class="w-24 shrink-0 cursor-pointer truncate sm:w-28" title="Верифікація пошти">
                    Верифікація пошти
                  </span>
                  <UiIconWarning />
                  <span class="flex-1 min-w-0 leading-snug sm:ml-5 sm:truncate">
                    {{ t("cabinet.dashboard.accountVerification.profileInProgress") }}
                  </span>
                </div>
                <UiTextSmall class="mb-2 !text-[var(--ui-primary-accent)]">
                  Підтвердіть email через лист — інколи він потрапляє в «Спам» або «Промоакції».
                </UiTextSmall>
              </li>

              <li
                  class="mb-2 rounded-sm border-b border-b-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-2 hover:opacity-75 sm:p-3"
              >
                <div class="flex min-h-[35px] items-start gap-3 sm:items-center">
                  <span class="w-24 shrink-0 cursor-pointer truncate sm:w-28" title="Документи">
                    Документи
                  </span>
                  <UiIconSuccess />
                  <span class="flex-1 min-w-0 leading-snug sm:ml-5 sm:truncate">
                    {{ t("cabinet.dashboard.accountVerification.documentVerified") }}
                  </span>
                </div>
              </li>

              <li class="rounded-sm bg-[--color-stroke-ui-dark] p-2 hover:opacity-75 sm:p-3">
                <div class="flex min-h-[35px] items-start gap-3 pb-2 sm:items-center sm:pb-3">
                  <span class="w-24 shrink-0 cursor-pointer truncate sm:w-28" title="1-й депозит">
                    1-й депозит
                  </span>
                  <UiIconWarning />
                  <span class="flex-1 min-w-0 leading-snug sm:ml-5 sm:truncate">
                    {{ t("cabinet.dashboard.accountVerification.paymentInProgress") }}
                  </span>
                </div>
                <UiTextSmall class="mb-2 !text-[var(--ui-primary-accent)]">
                  Зробіть перший депозит — після зарахування система автоматично оновить статус.
                </UiTextSmall>
              </li>
            </ul>
          </div>
        </PanelDefault>

          <!-- FULL WIDTH: transactions -->
          <TransactionsWidget class="col-span-1 lg:col-span-2" />
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
import UiIconWarning from "~/components/ui/UiIconWarning.vue";

import PanelDefault from "~/components/block/panels/PanelDefault.vue";
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
  background: var(--color-stroke-ui-dark);
  opacity: 0.95;
}
</style>
