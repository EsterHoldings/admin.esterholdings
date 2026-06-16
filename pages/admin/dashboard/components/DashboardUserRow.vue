<template>
  <button
    type="button"
    class="grid min-h-[50px] w-full grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[15px] border border-transparent bg-[color-mix(in_srgb,var(--ui-background-card)_48%,transparent)] px-2.5 py-2 text-left transition hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--ui-primary-main)_28%,var(--color-stroke-ui-light))] hover:bg-[color-mix(in_srgb,var(--ui-primary-main)_7%,var(--ui-background-card))] focus-visible:-translate-y-px focus-visible:border-[color-mix(in_srgb,var(--ui-primary-main)_28%,var(--color-stroke-ui-light))] focus-visible:bg-[color-mix(in_srgb,var(--ui-primary-main)_7%,var(--ui-background-card))] focus-visible:outline-none max-[820px]:grid-cols-[34px_minmax(0,1fr)] max-[820px]:items-start"
    @click="handleOpen">
    <span
      class="inline-flex h-[34px] w-[34px] items-center justify-center rounded-xl bg-gradient-to-br from-[var(--ui-primary-main)] to-[var(--ui-primary-accent)] text-[11px] font-[850] tracking-normal text-[var(--ui-text-invert)]">
      {{ initials }}
    </span>

    <span class="flex min-w-0 flex-col gap-1 text-left">
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-[820] leading-tight text-[var(--ui-text-main)]">
        {{ name }}
      </span>
      <span
        class="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-semibold leading-snug text-[var(--ui-text-secondary)]">
        {{ meta }}
      </span>
    </span>

    <DashboardInlineStatus
      class="max-[820px]:col-start-2 max-[820px]:justify-self-start"
      :label="statusLabel"
      :tone="statusTone" />
  </button>
</template>

<script setup lang="ts">
  import DashboardInlineStatus from "./DashboardInlineStatus.vue";
  import type {
    DashboardUserRowEmits,
    DashboardUserRowProps,
  } from "~/composables/admin/dashboard/components/DashboardUserRow";
  import { useDashboardUserRowSetup } from "~/composables/admin/dashboard/components/DashboardUserRow/setup";

  defineProps<DashboardUserRowProps>();
  const emit = defineEmits<DashboardUserRowEmits>();

  const { handleOpen } = useDashboardUserRowSetup(emit);
</script>
