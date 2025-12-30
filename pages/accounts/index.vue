<!-- pages/accounts/index.vue -->
<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <UiTextH4 class="text-[var(--ui-text-main)]">
          {{ t("cabinet.accounts.title") }}
        </UiTextH4>

        <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div class="auto-refresh-field">
            <span class="auto-refresh-field__label">
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

          <UiButtonDefault state="info" class="w-full sm:w-auto" @click="handleClickCreateNewAccount">
            <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
            <span class="whitespace-nowrap">New account</span>
          </UiButtonDefault>
        </div>
      </div>
    </template>

    <template #content>
      <AccountsPanel />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";
import AccountsPanel from "~/pages/accounts/components/AccountsPanel.vue";

import PageStructureContent from "~/components/block/pages/PageStructureContent.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";

import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiIconPlus from "~/components/ui/UiIconPlus.vue";
import UiSelect from "~/components/ui/UiSelect.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";

import { definePageMeta } from "~/.nuxt/imports";
import { useI18n } from "vue-i18n";
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import useEventBus from "~/composables/useEventBus";

definePageMeta({ layout: "cabinet", middleware: ["auth-client", "client-check-auth"] });

const { t } = useI18n({ useScope: "global" });
const { openModal } = inject("modalControl") as { openModal: Function };

const AUTO_REFRESH_STORAGE_KEY = "accountsAutoRefreshInterval";
const DEFAULT_REFRESH_SECONDS = "20";

const autoRefreshInterval = ref(DEFAULT_REFRESH_SECONDS);
const autoRefreshRemaining = ref(0);
const autoRefreshProgressValue = ref(0);
let autoRefreshTimer: ReturnType<typeof setInterval> | null = null;
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
  if (!autoRefreshTimer) return;
  clearInterval(autoRefreshTimer);
  autoRefreshTimer = null;
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

  autoRefreshTimer = setInterval(() => {
    if (!nextRefreshAt) return;
    const now = Date.now();
    const remainingMs = nextRefreshAt - now;
    const clampedRemainingMs = Math.max(0, remainingMs);
    const remainingSeconds = Math.max(0, Math.ceil(clampedRemainingMs / 1000));
    autoRefreshRemaining.value = remainingSeconds;
    autoRefreshProgressValue.value = ((totalMs - clampedRemainingMs) / totalMs) * 100;

    if (remainingMs <= 0) {
      useEventBus.emit("loadDataForAccounts");
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

onMounted(() => {
  initAutoRefresh();
});

onBeforeUnmount(() => {
  clearAutoRefresh();
});

const handleClickCreateNewAccount = () =>
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
</script>

<style scoped>
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
  font-size: 8px;
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
  max-width: 20px;
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
  width: 100%;
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

.icon-update {
  @apply h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200;
}
.icon-update:hover {
  @apply animate-[wiggle_.2s_ease];
}
.icon-update.spinning {
  @apply animate-spin;
}

.balance-sum {
  @apply cursor-pointer;
}
.wiggle:hover {
  @apply animate-[wiggle_.3s_ease];
}

@keyframes wiggle {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-2px);
  }
  40% {
    transform: translateX(2px);
  }
  60% {
    transform: translateX(-2px);
  }
  80% {
    transform: translateX(2px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>



<!--<template>-->
<!--  <UiContainer>-->
<!--    <div class="mb-5 mt-5 flex items-center justify-between">-->
<!--      <UiTextH4 class="text-[var(&#45;&#45;ui-text-main)]">{{ t('cabinet.accounts.title') }}</UiTextH4>-->
<!--      <UiButtonDefault state="info" @click="handleClickCreateNewAccount">-->
<!--        <UiIconPlus class="mr-2 fill-[var(&#45;&#45;ui-text-main)]" />-->
<!--        <span>New account</span>-->
<!--      </UiButtonDefault>-->
<!--    </div>-->
<!--    <div>-->
<!--      <AccountsPanel />-->
<!--    </div>-->
<!--  </UiContainer>-->
<!--</template>-->

<!--<script lang="ts" setup>-->
<!--import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";-->
<!--import AccountsPanel from '~/pages/accounts/components/AccountsPanel.vue'-->
<!--import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";-->
<!--import UiContainer from '~/components/ui/UiContainer.vue'-->
<!--import UiIconPlus from "~/components/ui/UiIconPlus.vue";-->
<!--import UiTextH4 from '~/components/ui/UiTextH4.vue'-->
<!--import { definePageMeta } from '~/.nuxt/imports'-->
<!--import { useI18n } from 'vue-i18n'-->
<!--import {inject} from "vue";-->

<!--definePageMeta({ layout: 'cabinet', middleware: ['auth-client', 'client-check-auth'] })-->

<!--const { t } = useI18n({ useScope: 'global' })-->
<!--const { openModal } = inject("modalControl") as { openModal: Function };-->

<!--const handleClickCreateNewAccount = () =>-->
<!--    openModal(AccountsCreateNew, {-->
<!--      title: t("cabinet.accounts.accounts-form.title"),-->
<!--    });-->
<!--</script>-->

<!--<style scoped>-->
<!--.icon-update {-->
<!--  @apply h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200;-->
<!--}-->
<!--.icon-update:hover {-->
<!--  @apply animate-[wiggle_.2s_ease];-->
<!--}-->
<!--.icon-update.spinning {-->
<!--  @apply animate-spin;-->
<!--}-->

<!--.balance-sum { @apply cursor-pointer; }-->
<!--.wiggle:hover { @apply animate-[wiggle_.3s_ease]; }-->

<!--@keyframes wiggle {-->
<!--  0%   { transform: translateX(0); }-->
<!--  20%  { transform: translateX(-2px); }-->
<!--  40%  { transform: translateX(2px); }-->
<!--  60%  { transform: translateX(-2px); }-->
<!--  80%  { transform: translateX(2px); }-->
<!--  100% { transform: translateX(0); }-->
<!--}-->
<!--</style>-->
