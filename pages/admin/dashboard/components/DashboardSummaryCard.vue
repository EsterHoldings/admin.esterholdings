<template>
  <button
    type="button"
    class="w-full min-w-0 cursor-pointer appearance-none border-0 bg-transparent p-0 text-left"
    @click="$emit('open', card.to)">
    <div :class="cardClass">
      <div class="relative z-[1] flex min-h-16 flex-col justify-start gap-1.5 p-2.5">
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
  import { computed } from "vue";
  import type { DashboardSummaryCard } from "../types";

  const props = defineProps<{
    card: DashboardSummaryCard;
  }>();

  defineEmits<{
    open: [to: string];
  }>();

  const toneClassMap: Record<DashboardSummaryCard["kind"], string> = {
    primary: "before:bg-[var(--ui-primary-main)]",
    accent: "before:bg-[var(--ui-primary-accent)]",
    info: "before:bg-[var(--color-info)]",
    warning: "before:bg-[var(--color-warning)]",
    success: "before:bg-[var(--color-success)]",
    danger: "before:bg-[var(--color-danger)]",
  };

  const iconClassMap: Record<DashboardSummaryCard["kind"], string> = {
    primary: "text-[var(--ui-primary-main)] bg-[color-mix(in_srgb,var(--ui-primary-main)_13%,transparent)]",
    accent: "text-[var(--ui-primary-accent)] bg-[color-mix(in_srgb,var(--ui-primary-accent)_13%,transparent)]",
    info: "text-[var(--color-info)] bg-[color-mix(in_srgb,var(--color-info)_13%,transparent)]",
    warning: "text-[var(--color-warning)] bg-[color-mix(in_srgb,var(--color-warning)_13%,transparent)]",
    success: "text-[var(--color-success)] bg-[color-mix(in_srgb,var(--color-success)_13%,transparent)]",
    danger: "text-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-danger)_13%,transparent)]",
  };

  const cardClass = computed(() => [
    "relative isolate h-full overflow-hidden rounded-[22px] border border-[color-mix(in_srgb,var(--ui-primary-main)_16%,var(--color-stroke-ui-light))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ui-background-card)_74%,transparent),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent))] backdrop-blur-[22px] transition duration-200 before:absolute before:inset-x-0 before:top-0 before:z-[1] before:h-0.5 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--ui-primary-main)_34%,var(--color-stroke-ui-light))]",
    toneClassMap[props.card.kind],
  ]);

  const iconClass = computed(() => [
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl",
    iconClassMap[props.card.kind],
  ]);
</script>
