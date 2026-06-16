<template>
  <label class="flex min-w-0 flex-col gap-1.5 border-0 bg-transparent p-0">
    <span class="text-[10px] font-[850] uppercase leading-tight tracking-[0.04em] text-[var(--ui-text-secondary)]">
      {{ label }}
    </span>
    <slot />
  </label>
</template>

<script setup lang="ts">
  defineProps<{
    label: string;
  }>();
</script>
