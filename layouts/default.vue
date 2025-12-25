<template>
  <div class="container-fluid">
    <div class="page-wrapper" :class="{ 'sidebar-open': isSidebarOpen }">
      <div class="sidebar-overlay" v-if="isSidebarOpen" @click="isSidebarOpen = false"></div>
      <AdminSidebar class="page-sidebar" :class="{ 'is-open': isSidebarOpen }" @close="isSidebarOpen = false" />

      <div class="page-content-wrapper">
        <AdminHeader class="page-header" @toggle-sidebar="isSidebarOpen = true" />
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
import AdminSidebar from "~/components/block/AdminSidebar.vue";

import UiImage from "~/components/ui/UiImage.vue";
import TheFooter from "@/components/block/TheFooter.vue";
import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";
import { ref, watch } from "vue";
import {useRoute} from "vue-router";
import UiContainer from "~/components/ui/UiContainer.vue";
import AdminHeader from "~/components/block/AdminHeader.vue";

const route = useRoute();
const isSidebarOpen = ref(false);

watch(
  () => route.fullPath,
  () => {
    isSidebarOpen.value = false;
  },
);
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
    position: relative;
  }

  &-content {
    width: 100%;
    overflow-y: scroll;
    height: 100vh;
    padding-top: 60px;

    &-wrapper {

    }
  }
}

.page-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 264px;
  z-index: 40;
  background: var(--ui-background-admin);
  width: calc(100% - 264px);
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 1023px) {
  .page-wrapper {
    grid-template-columns: 1fr;
  }

  .page-header {
    left: 0;
    width: 100%;
  }

  .page-sidebar {
    position: fixed;
    inset: 0 auto 0 0;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    z-index: 60;
  }

  .page-sidebar.is-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 50;
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
