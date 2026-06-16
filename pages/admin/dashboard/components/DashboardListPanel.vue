<template>
  <section
    class="relative isolate flex h-full flex-col gap-2.5 overflow-hidden rounded-[22px] border border-[color-mix(in_srgb,var(--ui-primary-main)_16%,var(--color-stroke-ui-light))] bg-[linear-gradient(145deg,color-mix(in_srgb,var(--ui-background-card)_74%,transparent),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent))] p-2.5 backdrop-blur-[22px]">
    <div
      class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 max-[820px]:flex max-[820px]:flex-col max-[820px]:items-stretch">
      <div class="flex min-w-0 flex-col gap-1">
        <h2 class="m-0 text-[17px] font-[820] leading-tight tracking-normal text-[var(--ui-text-main)]">
          {{ title }}
        </h2>
        <p class="m-0 text-xs leading-snug text-[var(--ui-text-secondary)]">
          {{ subtitle }}
        </p>
      </div>

      <span
        class="inline-flex h-6 min-w-[30px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--ui-primary-main)_11%,transparent)] px-2.5 text-xs font-[820] text-[var(--ui-primary-main)]">
        {{ count }}
      </span>
    </div>

    <div
      v-if="empty"
      class="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-[var(--color-stroke-ui-light)] bg-[color-mix(in_srgb,var(--ui-background-card)_48%,transparent)] p-4 text-center text-[13px] font-semibold leading-snug text-[var(--ui-text-secondary)]">
      {{ emptyText }}
    </div>

    <div
      v-else
      class="flex flex-col gap-2">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
  import type { DashboardListPanelProps } from "~/composables/admin/dashboard/components/DashboardListPanel";
  import { useDashboardListPanelSetup } from "~/composables/admin/dashboard/components/DashboardListPanel/setup";

  const props = defineProps<DashboardListPanelProps>();

  useDashboardListPanelSetup(props);
</script>
