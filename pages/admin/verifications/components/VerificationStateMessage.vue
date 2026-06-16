<template>
  <section
    class="flex min-h-[120px] items-center justify-center gap-3 rounded-[20px] border border-[var(--color-stroke-ui-light)] bg-[color-mix(in_srgb,var(--ui-background-card)_88%,transparent)] p-[18px] text-[var(--ui-text-main)]"
    :class="{ 'justify-between': isError }">
    <span>{{ message }}</span>
    <PrimeButton
      v-if="isError"
      :label="retryLabel"
      size="small"
      severity="secondary"
      outlined
      @click="$emit('retry')" />
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    message: string;
    isError?: boolean;
    retryLabel?: string;
  }>();

  defineEmits<{
    retry: [];
  }>();
</script>
