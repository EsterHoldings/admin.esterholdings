<template>
  <div class="accounts-index">
    <header class="accounts-index__header">
      <div class="accounts-index__title">
        <UiTextH4>{{ resolveText("admin.accounts.index.title", "Accounts") }}</UiTextH4>
        <UiTextParagraph>{{ resolveText("admin.accounts.index.subtitle", "List of accounts") }}</UiTextParagraph>
      </div>

      <PrimeButton
        v-if="canCreateAccounts"
        icon="pi pi-plus"
        :label="resolveText('admin.accounts.actions.create', 'New account')"
        @click="handleOpenCreateModal" />
    </header>

    <AccountsPanel />
  </div>
</template>

<script lang="ts" setup>
  import { computed, inject } from "vue";
  import { useI18n } from "vue-i18n";
  import { definePageMeta } from "~/.nuxt/imports";

  import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";
  import AccountsPanelAddNew from "~/pages/admin/accounts/components/AccountsPanelAddNew.vue";
  import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
  import UiTextH4 from "~/components/ui/UiTextH4.vue";
  import { useAdminAuthStore } from "~/stores/adminAuthStore";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { t } = useI18n({ useScope: "global" });
  const adminAuthStore = useAdminAuthStore();
  const { openModal } = inject("modalControl") as {
    openModal: (component: unknown, props?: Record<string, unknown>) => void;
  };

  const resolveText = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : String(value);
  };

  const canCreateAccounts = computed(
    () => adminAuthStore.hasRole("super-admin") || adminAuthStore.hasPermission("create-accounts")
  );

  const handleOpenCreateModal = () => {
    if (!canCreateAccounts.value) return;

    openModal(AccountsPanelAddNew, {
      title: resolveText("admin.accounts.form.titles.create", "Create account"),
    });
  };
</script>

<style scoped lang="scss">
  .accounts-index {
    width: 100%;
    display: grid;
    gap: 16px;
    padding: 10px;
  }

  .accounts-index__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .accounts-index__title {
    min-width: 0;
    display: grid;
    gap: 4px;
    color: var(--ui-text-main);
  }

  @media (max-width: 640px) {
    .accounts-index {
      padding: 8px 0;
    }

    .accounts-index__header {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
