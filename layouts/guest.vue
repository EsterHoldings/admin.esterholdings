<template>
  <div class="page__wrapper">
    <TheGuestHeader />
    <div class="page">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheGuestHeader from "~/components/block/TheGuestHeader.vue";
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100vh;
  overflow: hidden;

  &__wrapper {
    background-color: var(--ui-background-admin);
  }
}
</style>
