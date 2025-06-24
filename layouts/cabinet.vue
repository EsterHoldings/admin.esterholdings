<template>
  <div class="page__wrapper">
    <TheCabinetSideBar/>
    <UiImage class="bg-image" src="/space.gif"/>
    <Transition name="fade" mode="out-in">
      <div class="page" :key="route.fullPath">
        <slot/>
      </div>
    </Transition>
    <TheFooter/>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";

import TheCabinetSideBar from "~/components/block/TheCabinetSideBar.vue";
import TheFooter from "~/components/block/TheFooter.vue";
import UiImage from "~/components/ui/UiImage.vue";

const route = useRoute();
</script>

<style lang="scss" scoped>
.bg-image {
  position: fixed;
  left: 0;
  top: 0;
  opacity: 1;
  z-index: -1;
}

.page__wrapper {
  background-color: var(--ui-background-admin);
  height: 100vh;
  overflow: hidden;
}

.page {
  box-sizing: border-box;
  width: 100%;
  height: calc(100vh - 100px);
  padding: 40px 40px 40px 142px;
  overflow-y: auto;
  color: white;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 150ms ease;
}
</style>
