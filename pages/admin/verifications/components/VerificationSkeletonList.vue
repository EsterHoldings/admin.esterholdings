<template>
  <section class="flex flex-col">
    <PrimeSkeleton
      v-for="row in rows"
      :key="`verification-skeleton-${row}`"
      height="108px"
      border-radius="20px" />
  </section>
</template>

<script setup lang="ts">
  defineProps<{
    rows: number[];
  }>();
</script>
