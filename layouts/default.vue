<template>
  <div class="container-fluid">
    <div class="page-wrapper">
      <TheHeaderSideBar/>

      <div class="page-content-wrapper">
        <TheHeader />
        <Transition name="fade" mode="out-in">
          <div class="page-content">
            <div class="page" :key="route.fullPath">
              <UiContainer>
                <slot/>
              </UiContainer>
            </div>
          </div>
        </Transition>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import TheHeaderSideBar from "~/components/block/!!!TheHeaderSideBar.vue";

import UiImage from "~/components/ui/UiImage.vue";
import TheFooter from "@/components/block/TheFooter.vue";
import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";
import {useRoute} from "vue-router";
import UiContainer from "~/components/ui/UiContainer.vue";
import TheHeader from "~/components/block/TheHeader.vue";

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

.page {
  height: 100vh;
  overflow-y: auto;

  &-wrapper {
    display: grid;
    grid-template-columns: 264px 1fr;
    background-color: var(--ui-background-admin);
    color: #b0b0b0;
    overflow: hidden;
  }

  &-content {
    width: 100%;
    overflow-y: scroll;
    height: 100vh;

    &-wrapper {

    }
  }
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
