<template>
  <section class="grid grid-cols-4 gap-2.5 max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1">
    <div
      v-for="card in cards"
      :key="card.id"
      class="overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--ui-primary-main)_14%,var(--color-stroke-ui-light))] bg-[radial-gradient(circle_at_14%_0%,color-mix(in_srgb,var(--ui-primary-main)_7%,transparent),transparent_36%),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent)] shadow-[0_14px_36px_color-mix(in_srgb,#000000_9%,transparent)] backdrop-blur-[18px]">
      <div class="flex min-h-[104px] flex-col justify-between gap-2 p-[13px]">
        <span class="text-[11px] font-bold leading-snug text-[var(--ui-text-secondary)]">{{ card.label }}</span>
        <strong class="text-[clamp(22px,2vw,32px)] font-[860] leading-none tracking-normal text-[var(--ui-text-main)]">
          {{ card.value }}
        </strong>
        <span class="text-[11px] font-bold leading-snug text-[var(--ui-text-secondary)]">{{ card.hint }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { PaymentDetailSummaryCard } from "~/composables/admin/clients/components/TabPaymentDetails";

  defineProps<{
    cards: PaymentDetailSummaryCard[];
  }>();
</script>
