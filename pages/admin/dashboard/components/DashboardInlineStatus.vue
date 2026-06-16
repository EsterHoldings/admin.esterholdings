<template>
  <span
    class="inline-flex items-center justify-start gap-1.5 whitespace-nowrap text-xs font-bold leading-tight"
    :class="toneClass">
    <span class="h-[7px] w-[7px] shrink-0 rounded-full bg-current" />
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
  import type { DashboardInlineStatusProps } from "~/composables/admin/dashboard/components/DashboardInlineStatus";
  import { useDashboardInlineStatusSetup } from "~/composables/admin/dashboard/components/DashboardInlineStatus/setup";

  const props = withDefaults(defineProps<DashboardInlineStatusProps>(), {
    tone: "muted",
  });

  const { toneClass } = useDashboardInlineStatusSetup(props);
</script>
