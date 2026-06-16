<template>
  <span
    class="inline-flex items-center justify-start gap-1.5 whitespace-nowrap text-xs font-bold leading-tight"
    :class="toneClass">
    <span class="h-[7px] w-[7px] shrink-0 rounded-full bg-current" />
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import type { DashboardStatusTone } from "../types";

  const props = withDefaults(
    defineProps<{
      label: string;
      tone?: DashboardStatusTone;
    }>(),
    {
      tone: "muted",
    }
  );

  const toneClass = computed(() => {
    if (props.tone === "success") return "text-[var(--color-success)]";
    if (props.tone === "danger") return "text-[var(--color-danger)]";
    if (props.tone === "warning") return "text-[var(--color-warning)]";
    if (props.tone === "info") return "text-[var(--color-info)]";

    return "text-[var(--ui-text-secondary)]";
  });
</script>
