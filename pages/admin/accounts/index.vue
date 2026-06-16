<template>
  <div class="grid min-h-full w-full gap-4 p-2.5 text-[var(--ui-text-main)]">
    <AccountsHeader
      v-bind="accountsHeaderProps"
      @create="handleOpenCreateModal" />

    <AccountsPanel v-bind="accountsPanelProps" />
  </div>
</template>

<script lang="ts" setup>
  import { definePageMeta } from "~/.nuxt/imports";

  import AccountsHeader from "~/pages/admin/accounts/components/AccountsHeader.vue";
  import AccountsPanel from "~/pages/admin/accounts/components/AccountsPanel.vue";
  import { useAccountsPage } from "~/composables/admin/accounts/useAccountsPage";

  definePageMeta({
    middleware: ["admin-middleware"],
  });

  const { accountsHeaderProps, accountsPanelProps, handleOpenCreateModal } = useAccountsPage();
</script>
