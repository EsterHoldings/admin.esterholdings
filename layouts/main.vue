<template>
  <div class="container-fluid">
    <div class="page-wrapper">
      <div class="page-content">
        <LandingHeader />
        <div class="page">
          <slot />
        </div>

        <LandingFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import LandingHeader from "~/components/block/LandingHeader";
import LandingFooter from "~/components/block/LandingFooter";
</script>

<style lang="scss" scoped>
.page {
  // height: calc(100vh - 150px);
  overflow: scroll;

  &-wrapper {
    display: flex;
  }

  &-content {
    width: 100%;
    background-color: var(--color-ui-background);
  }
}
</style>
