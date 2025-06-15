<template>
  <h3 class="h3">
    <slot />
  </h3>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.h3 {
  color: var(--ui-text-main);
  // font-size: 16px;
  font-size: 32px;
  font-weight: 300;
  // line-height: 20px;
  letter-spacing: 0em;
}
</style>
