<template>
  <div class="container-fluid">
    <div class="page-wrapper">
      <TheHeaderSideBar />

      <div class="page-content">
        <div class="page">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeaderSideBar from "~/components/block/TheHeaderSideBar.vue";
import TheFooter from "@/components/block/TheFooter.vue";
import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";
</script>

<style lang="scss" scoped>
.page {
  height: 100vh;
  overflow-y: auto;
  //overflow: scroll;

  &-wrapper {
    display: flex;
    background-color: var(--ui-background);
    color: #b0b0b0;
  }

  &-content {
    width: 100%;
    overflow-y: scroll;
    height: 100vh;
  }
}
</style>
