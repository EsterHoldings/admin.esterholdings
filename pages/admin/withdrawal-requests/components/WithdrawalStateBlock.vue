<template>
  <section
    class="flex min-h-[180px] items-center justify-center rounded-2xl border border-[var(--color-stroke-ui-light)] bg-[var(--ui-background-panel)] p-4 text-center"
    :class="{ 'text-[var(--ui-sticker-danger)]': isError }">
    <UiIconSpinnerDefault v-if="isLoading" />
    <span v-else>{{ message }}</span>
  </section>
</template>

<script setup lang="ts">
  import UiIconSpinnerDefault from "~/components/ui/UiIconSpinnerDefault.vue";

  defineProps<{
    message?: string;
    isError?: boolean;
    isLoading?: boolean;
  }>();
</script>
