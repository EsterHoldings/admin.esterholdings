<script setup lang="ts">
  const props = defineProps({
    rotate180: {
      type: Boolean,
      default: false,
    },
  });
</script>

<template>
  <svg
    :class="{ 'rotate-180': props.rotate180 }"
    class="transition-transform"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.5 5.25L7 8.75L10.5 5.25"
      stroke="var(--ui-text-main)"
      stroke-linecap="round"
      stroke-linejoin="round" />
  </svg>
</template>

<style scoped lang="scss"></style>
