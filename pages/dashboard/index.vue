<template>
  <UiContainer>
    <div class="text-white">
      <div class="mb-6">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.dashboard.title") }}
        </UiTextH4>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- LEFT COLUMN: widgets + MT4 -->
        <div class="col-span-1 flex flex-col gap-6">
          <!-- 4 widgets -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-h-[260px]">
            <TotalAmountWidget />
            <PendingTransactionsWidget />
            <MissedNotificationsWidget />
            <ReferralTotalAmount />
          </div>

          <!-- MT4 accounts -->
          <PanelDefault>
            <div class="rounded-2xl p-4 sm:p-[1.6rem]">
              <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div class="text-[18px] font-semibold text-[var(--ui-text-main)]">
                  {{ t("cabinet.dashboard.mt4.title") }}
                </div>

                <NuxtLink to="/accounts" class="w-full sm:w-auto">
                  <UiButtonDefault state="primary" class="w-full sm:w-auto">
                    {{ t("cabinet.dashboard.mt4.openNewAccount") }}
                  </UiButtonDefault>
                </NuxtLink>
              </div>

              <div
                  class="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                <table class="min-w-[520px] w-full border-collapse text-sm text-white">
                  <thead>
                  <tr>
                    <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)] whitespace-nowrap">
                      {{ t("cabinet.dashboard.mt4.table.account") }}
                    </th>
                    <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)] whitespace-nowrap">
                      {{ t("cabinet.dashboard.mt4.table.type") }}
                    </th>
                    <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)] whitespace-nowrap">
                      {{ t("cabinet.dashboard.mt4.table.balance") }}
                    </th>
                    <th class="pb-2 text-left font-normal text-[var(--ui-text-secondary)] whitespace-nowrap">
                      {{ t("cabinet.dashboard.mt4.table.status") }}
                    </th>
                  </tr>
                  </thead>

                  <tbody>
                  <tr>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">123456</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">Real</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">$5,000.00</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">
                        <span class="font-medium text-[#1cbf73]">
                          {{ t("cabinet.dashboard.mt4.table.active") }}
                        </span>
                    </td>
                  </tr>

                  <tr>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">234567</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">Real</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">$5,000.00</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">
                        <span class="font-medium text-[#1cbf73]">
                          {{ t("cabinet.dashboard.mt4.table.active") }}
                        </span>
                    </td>
                  </tr>

                  <tr>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">345678</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">Demo</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">$10,000.00</td>
                    <td class="border-t border-[#2e335a] py-2 text-[var(--ui-text-secondary)] whitespace-nowrap">
                        <span class="font-medium text-[#a3aed0]">
                          {{ t("cabinet.dashboard.mt4.table.inactive") }}
                        </span>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </PanelDefault>
        </div>

        <!-- RIGHT COLUMN: verification -->
        <PanelDefault class="col-span-1">
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
                  class="mb-2 rounded-sm border-b border-b-[var(--color-stroke-ui-light)] bg-[--color-stroke-ui-dark] p-2 hover:opacity-75 sm:p-3"
              >
                <div class="flex min-h-[35px] items-start gap-3 pb-2 sm:items-center sm:pb-3">
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
  </UiContainer>
</template>

<script lang="ts" setup>
import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { onBeforeUnmount, onMounted } from "vue";
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

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { $echo } = useNuxtApp();

onMounted(() => {
  // @ts-ignore
  const sub = (window as any).Echo?.channel("test") ?? $echo.channel("test");
  sub.listen(".Ping", (e: any) => {
    console.log("[TEST] Ping received:", e);
  });
});

onBeforeUnmount(() => {
  try {
    // @ts-ignore
    $echo.leave("test");
  } catch {}
});
</script>
