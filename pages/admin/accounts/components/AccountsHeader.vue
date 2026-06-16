<template>
  <header
    class="flex items-start justify-between gap-4 rounded-xl bg-transparent px-5 py-[18px] text-[var(--ui-text-main)] max-[640px]:flex-col max-[640px]:items-stretch">
    <div class="grid min-w-0 gap-1.5">
      <h1 class="m-0 text-[28px] font-extrabold leading-[1.15] text-[var(--ui-text-main)]">{{ title }}</h1>
      <p class="m-0 max-w-[780px] text-sm leading-[1.45] text-[var(--ui-text-secondary)]">{{ subtitle }}</p>
    </div>

    <PrimeButton
      v-if="canCreateAccounts"
      class="min-h-[38px] rounded-lg border-0 bg-[var(--ui-primary-main)] font-bold text-white max-[640px]:w-full"
      icon="pi pi-plus"
      :label="createLabel"
      @click="handleCreate" />
  </header>
</template>

<script setup lang="ts">
  import type { AccountsHeaderEmit, AccountsHeaderProps } from "~/composables/admin/accounts/components/AccountsHeader";
  import { useAccountsHeaderSetup } from "~/composables/admin/accounts/components/AccountsHeader/setup";

  defineProps<AccountsHeaderProps>();
  const emit = defineEmits<AccountsHeaderEmit>();
  const { handleCreate } = useAccountsHeaderSetup(emit);
</script>
