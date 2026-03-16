<template>
  <PageStructureDefault>
    <template #header>
      <div class="flex w-full flex-col gap-1 text-[var(--ui-text-main)]">
        <div class="flex w-full items-center justify-between gap-4">
          <UiTextH4 class="min-w-0 truncate">{{ t("admin.accounts.index.title") }}</UiTextH4>

          <UiButtonDefault
            v-if="canCreateAccounts"
            state="secondary"
            class="shrink-0 whitespace-nowrap"
            @click="handleOpenCreateModal"
          >
            {{ resolveText("admin.accounts.actions.create", "New account") }}
          </UiButtonDefault>
        </div>

        <UiTextParagraph>{{ t("admin.accounts.index.subtitle") }}</UiTextParagraph>
      </div>
    </template>

    <template #content>
      <AccountsPanel />
    </template>
  </PageStructureDefault>
</template>

<script lang="ts" setup>
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { definePageMeta } from "~/.nuxt/imports";

import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";
import AccountsPanelAddNew from "~/pages/admin/accounts/components/AccountsPanelAddNew.vue";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiTextH4 from "~/components/ui/UiTextH4.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import PageStructureDefault from "~/components/block/pages/PageStructureDefault.vue";
import { useAdminAuthStore } from "~/stores/adminAuthStore";

definePageMeta({
  middleware: ["admin-middleware"],
});

const { t } = useI18n({ useScope: "global" });
const adminAuthStore = useAdminAuthStore();
const { openModal } = inject("modalControl") as { openModal: (component: unknown, props?: Record<string, unknown>) => void };

const resolveText = (key: string, fallback: string) => {
  const value = t(key);
  return value === key ? fallback : value;
};

const canCreateAccounts = computed(() => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-accounts"));

const handleOpenCreateModal = () => {
  if (!canCreateAccounts.value) return;

  openModal(AccountsPanelAddNew, {
    title: resolveText("admin.accounts.form.titles.create", "Create account"),
  });
};
</script>
