<template>
  <button
    type="button"
    class="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
    @click="handleOpen">
    <div :class="cardClass">
      <div class="relative z-[1] flex min-h-16 flex-col justify-start gap-1.5 p-3.5">
        <div class="flex items-start justify-between gap-2">
          <div class="flex min-w-0 flex-col gap-1">
            <span class="text-[11px] font-bold leading-snug tracking-normal text-[var(--ui-text-secondary)]">
              {{ card.label }}
            </span>
            <strong
              class="break-words text-[clamp(22px,1.85vw,30px)] font-[880] leading-none tracking-normal text-[var(--ui-text-main)]">
              {{ card.value }}
            </strong>
          </div>

          <div :class="iconClass">
            <component
              :is="card.icon"
              class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
  import type {
    DashboardSummaryCardEmits,
    DashboardSummaryCardProps,
  } from "~/composables/admin/dashboard/components/DashboardSummaryCard";
  import { useDashboardSummaryCardSetup } from "~/composables/admin/dashboard/components/DashboardSummaryCard/setup";

  const props = defineProps<DashboardSummaryCardProps>();
  const emit = defineEmits<DashboardSummaryCardEmits>();

  const { cardClass, handleOpen, iconClass } = useDashboardSummaryCardSetup(props, emit);
</script>
