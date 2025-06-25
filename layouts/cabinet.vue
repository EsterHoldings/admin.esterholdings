<template>
  <div class="page__wrapper">
    <TheCabinetSideBar/>
    <UiImage class="bg-image" src="/space.gif"/>
    <Transition name="fade" mode="out-in">
      <div class="page__wrapper_scroll">
        <div class="page" :key="route.fullPath">
          <slot/>
        </div>
        <TheFooter class="footer"/>
      </div>
    </Transition>
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
.footer {
  height: 120px;
}

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

  &_scroll {
    height: 100%;
    overflow: scroll;
  }
}

.page {
  box-sizing: border-box;
  width: 100%;
  height: auto;
  min-height: calc(100vh - 100px);
  padding: 40px 40px 40px 142px;
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
