<template>
  <header class="side-bar-cabinet">
    <div class="side-bar-cabinet__top">
      <div class="side-bar-cabinet__top__logo">
        <NuxtLink to="/">
          <UiIconLogo
            :class="{
              'svg-invert': isThemeLight,
            }" />
        </NuxtLink>
      </div>
      <button class="side-bar-cabinet__close" type="button" aria-label="Close menu" @click="emit('close')">
        ×
      </button>
    </div>

    <div class="side-bar-cabinet__content">
      <AdminSidebarMenu />
    </div>

    <div class="side-bar-cabinet__logout">
      <UiIconLogout
        @click="handleClickLogout"
        :class="{
          'svg-invert': isThemeLight,
        }" />
    </div>
  </header>
</template>

<script lang="ts" setup>
  import { computed } from "vue";
  import { navigateTo } from "nuxt/app";
  import { useAuthStore } from "~/stores/authStore";
  import { useRoute } from "vue-router";
  import { useThemeStore } from "~/stores/themeStore.js";
  import { useLocalePath } from "~/.nuxt/imports";

  import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
  import AdminSidebarMenu from "~/components/block/AdminSidebarMenu.vue";
  import UiIconLogo from "~/components/ui/UiIconLogo.vue";
  import UiIconLogout from "~/components/ui/UiIconLogout.vue";
  import UiIconMoon from "~/components/ui/UiIconMoon.vue";
  import UiIconSun from "~/components/ui/UiIconSun.vue";
  import UiImageCircle from "~/components/ui/UiImageCircle.vue";

  const emit = defineEmits(["close"]);

  const authStore = useAuthStore();
  const localePath = useLocalePath();
  const themeStore = useThemeStore();

  if (!authStore.user) {
    authStore.initAuth();
  }

  const handleClickLogout = () => {
    localStorage.setItem("access_token", "");
    localStorage.setItem("remember_token", "");

    console.log("AdminSidebar -> handleClickLogout");

    navigateTo(localePath("/admin/auth/login"));
  };

  const isThemeLight = computed(() => {
    return themeStore.currentTheme !== "dark";
  });

  const route = useRoute();
  const isProfileRoute = computed(() => {
    const segments = route.path.split("/");
    const last = segments[segments.length - 1];
    return last === "profile";
  });
</script>

<style lang="scss" scoped>
  .side-bar-cabinet {
    color: white;
    height: 100vh;
    width: 264px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 30px;
    border-right: 1px solid var(--color-stroke-ui);
    background-color: var(--ui-background-sidebar);
    z-index: 1;

    box-shadow: 0 0 5px -1px rgba(255, 249, 249, 0.1);
    transition: 0.5s;

    &:hover {
      transition: 0.3s;
      box-shadow: 0 0 5px 1px var(--ui-background-sidebar);
    }

    &__top {
      overflow: hidden;
      height: auto;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;

      flex-direction: column;

      &__logo {
        height: 60px;
        width: 100%;
        padding: 0 30px;
        display: flex;
        align-items: center;
        justify-content: flex-start;
      }

      &__profile {
        &__image {
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 62px;
          width: 62px;
          border: 3px solid var(--color-stroke-ui);
          border-radius: 25%;

          img {
            width: 60px;
            height: 58px;
            object-fit: cover;
            border-radius: 23%;
          }

          &.active {
            border-color: var(--ui-primary-accent);
          }
        }

        &__name {
          margin-top: 15px;
          width: 100%;
          font-size: 13px;
        }
      }
    }

    &__content {
      padding: 10px;
      height: calc(100vh - 160px);
      overflow-y: scroll;
      width: 100%;

      display: flex;
      align-items: flex-start;

      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        width: 0;
        height: 0;
        background: transparent;
      }
    }

    &__actions {
      height: 72px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      // padding: 0 10px;
    }

    &__logout {
      height: 72px;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      border-top: 1px solid var(--color-stroke-ui);

      padding: 10px;
    }
  }

  .svg-invert {
    filter: invert(1);
  }

  @keyframes shadowPulse {
    0% {
      box-shadow: 0 0 1px -1px var(--color-stroke-ui);
    }
    100% {
      box-shadow: 0 0 5px 1px var(--color-stroke-ui);
    }
  }

  .icon {
    cursor: pointer;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .side-bar-cabinet__close {
    display: none;
    height: 36px;
    width: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui);
    background: transparent;
    color: var(--ui-text-main);
    font-size: 20px;
    line-height: 1;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  @media (max-width: 1023px) {
    .side-bar-cabinet__top {
      position: relative;
    }

    .side-bar-cabinet__close {
      display: inline-flex;
      position: absolute;
      right: 16px;
      top: 12px;
    }
  }
</style>
