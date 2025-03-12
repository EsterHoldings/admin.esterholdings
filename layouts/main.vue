<template>
  <div class="page-wrapper">
    <div class="page-content">
      <LandingHeader class="header" />
      <div class="page">
        <slot />
      </div>
      <LandingFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import LandingHeader from "~/components/block/LandingHeader";
import LandingFooter from "~/components/block/LandingFooter";
</script>

<style lang="scss" scoped>
.header {
  z-index: 9999;
}

.page {
  min-height: 100vh;
  overflow: unset;

  &-wrapper {
    display: flex;
  }

  &-content {
    width: 100%;
    background-color: var(--color-ui-background);
  }
}
</style>
