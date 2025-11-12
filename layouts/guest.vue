<template>
  <div class="page__wrapper">
    <TheGuestHeader />
    <UiImage class="bg-image" src="/space.gif" />
    <div class="page">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import TheGuestHeader from "~/components/block/TheGuestHeader.vue";
import UiImage from "~/components/ui/UiImage.vue";
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  //height: 100vh;
  overflow: hidden;

  &__wrapper {
    background-color: var(--ui-background-admin);
  }
}
.bg-image {
  position: fixed;
  left: 0;
  top: 0;
  opacity: 1;
  z-index: -1;
}
</style>
