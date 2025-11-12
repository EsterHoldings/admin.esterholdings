<template>
  <aside
    class="hidden lg:flex fixed inset-y-0 left-0 w-[240px] flex-col items-center justify-between bg-[var(--ui-background-sidebar)]/82 backdrop-blur-md text-[var(--ui-text-main)] z-40 shadow-[0_0_5px_-1px_rgba(255,249,249,.1)] border-r border-r-[var(--color-stroke-ui-light)]">
    <!-- Top -->
    <div class="w-full flex flex-col items-start">
      <div class="h-[100px] flex items-center justify-start pl-5">
        <NuxtLink
          to="/"
          class="logo text-[var(--ui-text-main)]">
          <UiIconLogo class="w-24 h-6" />
        </NuxtLink>
      </div>
    </div>

    <div class="flex-1 w-full flex items-start justify-center">
      <TheCabinetSideBarMenu />
    </div>

    <!-- <button
        class="h-[52px] w-full flex items-center justify-center hover:bg-[var(--color-stroke-ui-dark)]/60"
        @click="handleClickLogout"
        aria-label="Logout"
    >
      <UiIconLogout />
    </button> -->
  </aside>

  <!-- ===== Mobile header (lg-) ===== -->
  <header
    class="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-[var(--ui-background-sidebar)]/78 backdrop-blur-xl text-[var(--ui-text-main)] shadow-[0_6px_24px_-12px_rgba(0,0,0,.6)]">
    <div class="h-full px-4 flex items-center justify-between">
      <NuxtLink
        to="/"
        class="logo"
        aria-label="Home">
        <UiIconLogo class="w-24 h-6" />
      </NuxtLink>

      <div class="flex items-center gap-3">
        <LanguageSwitcher
          isSidebar
          :isInvert="isThemeLight"
          class="icon" />
        <transition
          name="fade"
          mode="out-in">
          <button
            :key="themeStore.currentTheme"
            @click="themeStore.toggleTheme()"
            class="icon"
            aria-label="Toggle theme">
            <UiIconMoon v-if="themeStore.currentTheme === 'dark'" />
            <UiIconSun v-else />
          </button>
        </transition>

        <div class="relative">
          <button
            class="relative"
            @click="handleClickNotifications"
            aria-label="Notifications">
            <UiIconBell />
            <span
              class="absolute -top-2 -right-2 h-5 w-5 text-[10px] font-bold rounded-full bg-[var(--color-warning)] text-[var(--ui-text-main)] flex items-center justify-center"
              >3</span
            >
          </button>

          <PanelDefault
            v-if="isOpen"
            class="absolute right-0 mt-2 z-50 w-[92vw] max-w-[420px] min-h-[220px] max-h-[60vh] p-4 rounded-xl bg-[var(--ui-background)]/95 backdrop-blur-md border border-[var(--color-stroke-ui-dark)]/40">
            <div class="mb-4 flex items-center justify-between">
              <span>14 items</span>
              <UiButtonDefault state="info--outline--small">Clean</UiButtonDefault>
            </div>

            <div
              v-for="notification in notifications"
              :key="notification.message"
              :class="[
                'relative mb-2.5 p-4 rounded-xl bg-[var(--color-stroke-ui-dark)]/60',
                notification.type === 'info' ? 'text-[var(--color-info)]' : '',
                notification.type === 'success' ? 'text-[var(--color-success)]' : '',
                notification.type === 'warning' ? 'text-[var(--color-warning)]' : '',
                notification.type === 'danger' ? 'text-[var(--color-danger)]' : '',
                notification.wasRead ? 'opacity-30 hover:opacity-100' : '',
              ]">
              {{ notification.message }}
              <UiIconDelete class="absolute top-2.5 right-2.5 opacity-50 hover:opacity-100" />
            </div>
          </PanelDefault>
        </div>

        <!-- Logout у хедері мобільної версії -->
        <button
          class="h-10 w-10 rounded-2xl flex items-center justify-center bg-[var(--color-stroke-ui-dark)]/60 hover:bg-[var(--color-stroke-ui-dark)] active:bg-[var(--ui-background-panel)]/80"
          @click="handleClickLogout"
          aria-label="Logout">
          <UiIconLogout />
        </button>

        <NuxtLink
          to="/ru/profile"
          class="flex items-center"
          aria-label="Profile">
          <div
            :class="[
              'h-10 w-10 rounded-2xl flex items-center justify-center overflow-hidden',
              isProfileRoute ? 'ring-2 ring-[var(--ui-primary-main)]' : 'ring-2 ring-[var(--ui-text-main)]',
            ]">
            <UiIconUser v-if="!authStore.photoUrl" />
            <img
              v-else
              :src="authStore.photoUrl"
              alt="User Photo"
              class="h-full w-full object-cover" />
          </div>
        </NuxtLink>
      </div>
    </div>
  </header>

  <!-- ===== Mobile bottom nav (lg-) ===== -->
  <nav
    class="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16 pb-[env(safe-area-inset-bottom)] bg-[var(--ui-background-sidebar)]/78 backdrop-blur-xl text-[var(--ui-text-main)] shadow-[0_-8px_24px_-16px_rgba(0,0,0,.6)]">
    <div class="h-full px-2 flex items-center justify-evenly gap-1 overflow-hidden">
      <TheCabinetSideBarMenu class="mobile-bottom-menu flex-1" />
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
  import TheCabinetSideBarMenu from "~/components/block/TheCabinetSideBarMenu.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiIconUser from "~/components/ui/UiIconUser.vue";
  import UiIconBell from "~/components/ui/UiIconBell.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";
  import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
  import UiIconDelete from "~/components/ui/UiIconDelete.vue";

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
  /* fade */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .logo :deep(svg),
  .logo :deep(img) {
    display: block;
    width: 100%;
    height: 100%;
    fill: currentColor;
    filter: none !important;
    background: transparent !important;
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
    flex: 0 0 56px; /* однакова ширина */
    width: 56px;
    height: 48px; /* однакова висота */
    border-radius: 14px;
    background: color-mix(in oklab, var(--color-stroke-ui-dark) 60%, transparent);
    font-size: 0; /* приховати текст, навіть якщо немає окремого елемента */
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

  /* додатково: якщо в меню є підписи — ховаємо їх */
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
