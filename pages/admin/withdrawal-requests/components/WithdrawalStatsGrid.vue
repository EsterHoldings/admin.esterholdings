<template>
  <div class="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
    <button
      v-for="card in cards"
      :key="card.id"
      :class="cardClass(card)"
      type="button"
      @click="handleFilter(card.status)">
      <div class="text-xs text-[var(--ui-text-secondary)]">{{ card.label }}</div>
      <div class="mt-1.5 text-[26px] font-bold leading-none text-[var(--ui-text-main)]">{{ card.value }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
  import type {
    WithdrawalStatsGridEmits,
    WithdrawalStatsGridProps,
  } from "~/composables/admin/withdrawal-requests/components/WithdrawalStatsGrid";
  import { useWithdrawalStatsGridSetup } from "~/composables/admin/withdrawal-requests/components/WithdrawalStatsGrid/setup";

  defineProps<WithdrawalStatsGridProps>();
  const emit = defineEmits<WithdrawalStatsGridEmits>();

  const { cardClass, handleFilter } = useWithdrawalStatsGridSetup(emit);
</script>
