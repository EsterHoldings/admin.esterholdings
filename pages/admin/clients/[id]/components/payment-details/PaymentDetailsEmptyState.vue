<template>
  <section
    class="overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--ui-primary-main)_14%,var(--color-stroke-ui-light))] bg-[radial-gradient(circle_at_14%_0%,color-mix(in_srgb,var(--ui-primary-main)_7%,transparent),transparent_36%),color-mix(in_srgb,var(--ui-background-panel)_86%,transparent)] shadow-[0_14px_36px_color-mix(in_srgb,#000000_9%,transparent)] backdrop-blur-[18px]">
    <div
      class="flex min-h-[260px] flex-col items-center justify-center gap-2 p-6 text-center text-[var(--ui-text-secondary)]">
      <i
        class="pi pi-credit-card text-[30px] text-[var(--ui-primary-main)]"
        aria-hidden="true" />
      <strong class="text-[17px] font-[840] text-[var(--ui-text-main)]">{{ title }}</strong>
      <span class="max-w-[420px] text-[13px] leading-normal">{{ subtitle }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    title: string;
    subtitle: string;
  }>();
</script>
