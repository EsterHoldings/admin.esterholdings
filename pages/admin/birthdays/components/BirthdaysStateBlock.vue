<template>
  <div :class="blockClass">
    <span
      v-if="loading"
      class="pi pi-spin pi-spinner" />
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
  import type { BirthdaysStateBlockProps } from "~/composables/admin/birthdays/components/BirthdaysStateBlock";
  import { useBirthdaysStateBlockSetup } from "~/composables/admin/birthdays/components/BirthdaysStateBlock/setup";

  const props = withDefaults(defineProps<BirthdaysStateBlockProps>(), {
    danger: false,
    loading: false,
  });
  const { blockClass } = useBirthdaysStateBlockSetup(props);
</script>
