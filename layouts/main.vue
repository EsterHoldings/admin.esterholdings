<template>
  <div class="page-wrapper">
    <div class="page-content">
      <LandingHeader class="header" />

      <transition name="fade" mode="out-in">
        <div class="page"><slot /></div>
      </transition>

      <LandingFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import LandingHeader from "~/components/block/LandingHeader.vue";
import LandingFooter from "~/components/block/LandingFooter";
</script>

<style lang="scss" scoped>
.header {
  z-index: 9999;
}

.page {
  //min-height: 100vh;
  overflow: unset;

  &-wrapper {
    display: flex;
    overflow: hidden;
  }

  &-content {
    width: 100%;
    background-color: var(--ui-background);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
