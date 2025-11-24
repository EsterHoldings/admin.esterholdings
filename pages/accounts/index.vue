<template>
  <UiContainer>
    <div class="mb-5 mt-5 flex items-center justify-between">
      <UiTextH4 class="text-[var(--ui-text-main)]">{{ t('cabinet.accounts.title') }}</UiTextH4>
      <UiButtonDefault state="info" @click="handleClickCreateNewAccount">
        <UiIconPlus class="mr-2 fill-[var(--ui-text-main)]" />
        <span>New account</span>
      </UiButtonDefault>
    </div>
    <div>
      <AccountsPanel />
    </div>
  </UiContainer>
</template>

<script lang="ts" setup>
import AccountsCreateNew from "~/pages/accounts/components/AccountsCreateNew.vue";
import AccountsPanel from '~/pages/accounts/components/AccountsPanel.vue'
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import UiContainer from '~/components/ui/UiContainer.vue'
import UiIconPlus from "~/components/ui/UiIconPlus.vue";
import UiTextH4 from '~/components/ui/UiTextH4.vue'
import { definePageMeta } from '~/.nuxt/imports'
import { useI18n } from 'vue-i18n'
import {inject} from "vue";

definePageMeta({ layout: 'cabinet', middleware: ['auth-client', 'client-check-auth'] })

const { t } = useI18n({ useScope: 'global' })
const { openModal } = inject("modalControl") as { openModal: Function };

const handleClickCreateNewAccount = () =>
    openModal(AccountsCreateNew, {
      title: t("cabinet.accounts.accounts-form.title"),
    });
</script>

<style scoped>
.icon-update {
  @apply h-[14px] w-[14px] mr-[10px] cursor-pointer transition-transform duration-200;
}
.icon-update:hover {
  @apply animate-[wiggle_.2s_ease];
}
.icon-update.spinning {
  @apply animate-spin;
}

.balance-sum { @apply cursor-pointer; }
.wiggle:hover { @apply animate-[wiggle_.3s_ease]; }

@keyframes wiggle {
  0%   { transform: translateX(0); }
  20%  { transform: translateX(-2px); }
  40%  { transform: translateX(2px); }
  60%  { transform: translateX(-2px); }
  80%  { transform: translateX(2px); }
  100% { transform: translateX(0); }
}
</style>
