<template>
  <div class="accounts-index">
    <header class="accounts-index__header">
      <div class="accounts-index__title">
        <h1 class="accounts-index__heading">{{ resolveText("admin.accounts.index.title", "Accounts") }}</h1>
        <p class="accounts-index__subtitle">{{ resolveText("admin.accounts.index.subtitle", "List of accounts") }}</p>
      </div>

      <PrimeButton
        v-if="canCreateAccounts"
        class="accounts-index__create"
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
    min-height: 100%;
    display: grid;
    gap: 16px;
    padding: 10px;
    color: var(--ui-text-main);
  }

  .accounts-index__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 20px;
    border: 0 !important;
    border-radius: 12px;
    background: transparent !important;
    box-shadow: none !important;
  }

  .accounts-index__title {
    min-width: 0;
    display: grid;
    gap: 6px;
    color: var(--ui-text-main);
  }

  .accounts-index__heading {
    margin: 0;
    color: var(--ui-text-main);
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
  }

  .accounts-index__subtitle {
    max-width: 780px;
    margin: 0;
    color: var(--ui-text-secondary);
    font-size: 14px;
    line-height: 1.45;
  }

  .accounts-index__create {
    min-height: 38px;
    border: 0;
    border-radius: 8px;
    background: var(--ui-primary-main);
    color: #fff;
    font-weight: 700;
  }

  @media (max-width: 640px) {
    .accounts-index {
      padding: 10px;
    }

    .accounts-index__header {
      flex-direction: column;
      align-items: stretch;
    }

    .accounts-index__create {
      width: 100%;
    }
  }
</style>
