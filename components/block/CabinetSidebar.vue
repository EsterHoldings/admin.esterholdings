<template>
  <aside class="hidden lg:flex fixed inset-y-0 left-0 w-[240px] flex-col items-center justify-between bg-[var(--ui-background-sidebar)]/82 backdrop-blur-md text-[var(--ui-text-main)] z-40 shadow-[0_0_5px_-1px_rgba(255,249,249,.1)] border-r border-r-[var(--color-stroke-ui-light)]">
    <div class="w-full flex flex-col items-start">
      <div class="h-[60px] flex items-center justify-center pl-5 mb-8">
        <NuxtLink to="/">
          <UiIconLogoLight v-if="isThemeLight" />
          <UiIconLogo v-else />
        </NuxtLink>
      </div>
    </div>

    <div class="flex-1 w-full flex items-start justify-center p-2">
      <CabinetSidebarMenu />
    </div>
  </aside>

  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-50 h-[90px] pb-[env(safe-area-inset-bottom)] bg-[var(--ui-background-sidebar)]/78 backdrop-blur-xl text-[var(--ui-text-main)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,.6)]">
    <div class="h-full px-2 flex items-start justify-evenly gap-1 overflow-hidden">
      <CabinetSidebarMenu class="mobile-bottom-menu flex-1" />
    </div>
  </nav>
</template>

<script lang="ts" setup>
  import { useRoute } from "vue-router";
  import { navigateTo } from "nuxt/app";
  import { computed, reactive, ref } from "vue";

  import { useThemeStore } from "~/stores/themeStore.js";
  import { useAuthStore } from "~/stores/authStore";

  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import CabinetSidebarMenu from "~/components/block/CabinetSidebarMenu.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";
  import UiIconLogoLight from "~/components/ui/UiIconLogoLight.vue";

  const authStore = useAuthStore();
  const themeStore = useThemeStore();

  const isOpen = ref(false);
  const isLoading = ref(false);
  const notifications = reactive([
    { type: "info", message: "Test info notification message", wasRead: false },
    { type: "warning", message: "Test warning notification message", wasRead: false },
    { type: "success", message: "Test success notification message", wasRead: false },
    { type: "danger", message: "Test danger notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
    { type: "info", message: "Test info notification message", wasRead: true },
  ]);

  if (!authStore.user) authStore.initAuth();

  const handleClickLogout = () => {
    authStore.setAccessToken("");
    navigateTo("/auth/login");
  };

  const isThemeLight = computed(() => themeStore.currentTheme !== "dark");

  const route = useRoute();
  const isProfileRoute = computed(() => route.path.split("/").pop() === "profile");

  const handleClickNotifications = () => (isOpen.value = !isOpen.value);
</script>

<style scoped>
  .logo :deep(svg),
  .logo :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .mobile-bottom-menu :deep(nav),
  .mobile-bottom-menu :deep(ul),
  .mobile-bottom-menu :deep(.menu),
  .mobile-bottom-menu :deep(.cabinet-menu) {
    display: flex !important;
    align-items: center;
    justify-content: space-evenly;
    gap: 0.25rem;
    width: 100%;
    height: 100%;
  }

  .mobile-bottom-menu :deep(a),
  .mobile-bottom-menu :deep(button),
  .mobile-bottom-menu :deep(.cabinet-menu__item) {
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    flex: 0 0 56px;
    width: 56px;
    height: 48px;
    border-radius: 14px;
    background: color-mix(in oklab, var(--color-stroke-ui-dark) 60%, transparent);
    font-size: 0;
    white-space: nowrap;
  }

  .mobile-bottom-menu :deep(a.router-link-active),
  .mobile-bottom-menu :deep(.active) {
    background: var(--color-stroke-ui-dark);
  }

  .mobile-bottom-menu :deep(svg) {
    width: 22px;
    height: 22px;
  }

  .mobile-bottom-menu :deep(.w-full.flex.items-center.justify-center.h-\[40px\]),
  .mobile-bottom-menu :deep(.w-full.flex.items-center.justify-center.h-\[4px\]) {
    display: none !important;
  }

  .mobile-bottom-menu :deep(span),
  .mobile-bottom-menu :deep(.label),
  .mobile-bottom-menu :deep(.title),
  .mobile-bottom-menu :deep(.text),
  .mobile-bottom-menu :deep(p),
  .mobile-bottom-menu :deep(small),
  .mobile-bottom-menu :deep(em),
  .mobile-bottom-menu :deep(strong) {
    display: none !important;
  }
</style>
