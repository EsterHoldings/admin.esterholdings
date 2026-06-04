<template>
  <NuxtLayout>
    <ModalRightSideDefault ref="modalRef">
      <component
        :is="modalContent"
        v-bind="modalProps"
        :key="modalKey" />
    </ModalRightSideDefault>

    <VitePwaManifest />
    <NuxtPage />
  </NuxtLayout>

  <Transition
    name="admin-boot-loader"
    appear>
    <div
      v-if="showBootLoader"
      class="admin-boot-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading Ester Admin">
      <div class="admin-boot-loader__content">
        <div class="admin-boot-loader__logo">
          <img
            src="/favicon/favicon-192x192.png"
            alt=""
            width="72"
            height="72" />
        </div>
        <div class="admin-boot-loader__brand">ESTER</div>
        <div
          class="admin-boot-loader__bar"
          aria-hidden="true">
          <span></span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onBeforeUnmount, onMounted, provide, ref } from "vue";
  import { useHead, useNuxtApp, useRouter } from "#imports";

  import ModalRightSideDefault from "./components/block/modals/ModalRightSideDefault.vue";
  import { useThemeStore } from "./stores/themeStore";
  import { markAdminAppReady, recoverAdminBoot } from "./utils/adminBootRecovery";

  import "vue-draggable-resizable/style.css";

  const modalRef = ref();
  const modalContent = ref(null);
  const modalProps = ref({});
  const modalKey = ref(0);
  const isAppBooting = ref(process.client);
  const isRouteLoading = ref(false);
  const nuxtApp = useNuxtApp();
  const router = useRouter();
  let routeLoaderTimer: ReturnType<typeof setTimeout> | null = null;
  let bootRecoveryTimer: ReturnType<typeof setTimeout> | null = null;
  let bootFrame = 0;

  const showBootLoader = computed(() => isAppBooting.value || isRouteLoading.value);

  const openModal = (component: any, props = {}) => {
    modalContent.value = component;
    modalProps.value = props;
    modalKey.value++;
    modalRef.value?.openModal();
  };

  const closeModal = () => modalRef.value?.closeModal();

  provide("modalControl", { openModal, closeModal });

  const clearRouteLoaderTimer = () => {
    if (!routeLoaderTimer) return;

    clearTimeout(routeLoaderTimer);
    routeLoaderTimer = null;
  };

  const finishBoot = async () => {
    await nextTick();

    if (!process.client) {
      isAppBooting.value = false;
      return;
    }

    bootFrame = window.requestAnimationFrame(() => {
      isAppBooting.value = false;
      clearBootRecoveryTimer();
      markAdminAppReady();
    });
  };

  const clearBootRecoveryTimer = () => {
    if (!bootRecoveryTimer) return;

    clearTimeout(bootRecoveryTimer);
    bootRecoveryTimer = null;
  };

  const scheduleBootRecovery = () => {
    if (!process.client) return;

    clearBootRecoveryTimer();
    bootRecoveryTimer = setTimeout(() => {
      const isReady = document.documentElement.dataset.adminAppReady === "true";
      if (isReady) return;

      void recoverAdminBoot("admin boot timeout").then(recovered => {
        if (recovered) return;

        clearRouteLoaderTimer();
        isRouteLoading.value = false;
        isAppBooting.value = false;
        markAdminAppReady();
      });
    }, 18000);
  };

  nuxtApp.hook("page:start", () => {
    if (!process.client || isAppBooting.value) return;

    clearRouteLoaderTimer();
    routeLoaderTimer = setTimeout(() => {
      isRouteLoading.value = true;
    }, 180);
  });

  nuxtApp.hook("page:finish", () => {
    clearRouteLoaderTimer();
    isRouteLoading.value = false;
  });

  nuxtApp.hook("app:error", () => {
    clearRouteLoaderTimer();
    clearBootRecoveryTimer();
    isRouteLoading.value = false;
    isAppBooting.value = false;
    markAdminAppReady();
  });

  useHead({
    meta: [
      { name: "theme-color", content: "#000028" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
  });

  onMounted(() => {
    scheduleBootRecovery();

    const themeStore = useThemeStore();
    themeStore.initTheme();

    router.isReady().finally(() => {
      void finishBoot();
    });
  });

  onBeforeUnmount(() => {
    clearRouteLoaderTimer();
    clearBootRecoveryTimer();

    if (bootFrame) {
      window.cancelAnimationFrame(bootFrame);
    }
  });
</script>

<style lang="scss">
  .admin-boot-loader {
    position: fixed;
    inset: 0;
    z-index: 100000;
    display: grid;
    place-items: center;
    min-height: 100vh;
    min-height: 100dvh;
    padding: 32px;
    color: #ffffff;
    background:
      radial-gradient(circle at 50% 42%, rgba(38, 101, 255, 0.22), transparent 34%),
      linear-gradient(180deg, #020a22 0%, #000028 58%, #00001c 100%);
  }

  .admin-boot-loader__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  .admin-boot-loader__logo {
    display: grid;
    place-items: center;
    width: 96px;
    height: 96px;
    border: 1px solid rgba(91, 141, 255, 0.38);
    border-radius: 24px;
    background: rgba(8, 25, 65, 0.58);
    box-shadow:
      0 22px 70px rgba(0, 0, 0, 0.34),
      inset 0 0 24px rgba(93, 141, 255, 0.12);
    animation: admin-loader-logo-pulse 1.7s ease-in-out infinite;
  }

  .admin-boot-loader__logo img {
    width: 72px;
    height: 72px;
    object-fit: contain;
  }

  .admin-boot-loader__brand {
    color: rgba(255, 255, 255, 0.92);
    font-size: 15px;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0;
  }

  .admin-boot-loader__bar {
    position: relative;
    width: min(180px, 48vw);
    height: 3px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
  }

  .admin-boot-loader__bar span {
    position: absolute;
    inset: 0;
    width: 42%;
    border-radius: inherit;
    background: linear-gradient(90deg, rgba(61, 117, 255, 0), #5287ff, rgba(255, 111, 49, 0.92));
    animation: admin-loader-bar 1.35s ease-in-out infinite;
  }

  .admin-boot-loader-enter-active,
  .admin-boot-loader-leave-active {
    transition:
      opacity 220ms ease,
      transform 220ms ease;
  }

  .admin-boot-loader-leave-active {
    pointer-events: none;
  }

  .admin-boot-loader-enter-from,
  .admin-boot-loader-leave-to {
    opacity: 0;
    transform: scale(0.985);
  }

  @keyframes admin-loader-logo-pulse {
    0%,
    100% {
      opacity: 0.72;
      transform: scale(0.98);
    }

    50% {
      opacity: 1;
      transform: scale(1.02);
    }
  }

  @keyframes admin-loader-bar {
    0% {
      transform: translateX(-115%);
    }

    100% {
      transform: translateX(245%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .admin-boot-loader,
    .admin-boot-loader__logo,
    .admin-boot-loader__bar span {
      animation: none;
      transition: none;
    }
  }
</style>
