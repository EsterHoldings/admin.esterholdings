<template>
  <header class="side-bar-cabinet">
    <div class="side-bar-cabinet__top">
      <div class="side-bar-cabinet__top__logo">
        <NuxtLink to="/"
        >
          <UiIconLogo
              :class="{
              'svg-invert': isThemeLight,
            }"
          />
        </NuxtLink>
      </div>
      <div class="side-bar-cabinet__top__profile">
        <NuxtLink to="/ru/profile">
          <div
              :class="[
              'side-bar-cabinet__top__profile__image',
              { active: isProfileRoute },
            ]"
          >
            <UiIconUser v-if="!authStore.photoUrl"/>
            <img
                v-if="authStore.photoUrl"
                :src="authStore.photoUrl"
                alt="User Photo"
            />
          </div>
        </NuxtLink>
      </div>

      <div class="side-bar-cabinet__actions">
        <LanguageSwitcher isSidebar :isInvert="isThemeLight" class="icon"/>

        <transition name="fade" mode="out-in">
          <span
              :key="themeStore.currentTheme"
              @click="themeStore.toggleTheme()"
              class="icon"
          >
            <UiIconMoon v-if="themeStore.currentTheme === 'dark'"/>
            <UiIconSun
                v-else
                :class="{
                'svg-invert': isThemeLight,
              }"
            />
          </span>
        </transition>
      </div>
    </div>
    <div class="side-bar-cabinet__content">
      <TheCabinetSideBarMenu/>
    </div>
    <div class="side-bar-cabinet__logout">
      <UiIconLogout
          @click="handleClickLogout"
          :class="{
          'svg-invert': isThemeLight,
        }"
      />
    </div>
  </header>
</template>

<script lang="ts" setup>
import {useUiStore} from "~/stores/uiStore";
import {useThemeStore} from "~/stores/themeStore.js";
import {useAuthStore} from "~/stores/authStore";
import {useRoute} from "vue-router";
import {navigateTo} from "nuxt/app";
import {computed} from "vue";

import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
import TheCabinetSideBarMenu from "~/components/block/TheCabinetSideBarMenu.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconLogout from "~/components/ui/UiIconLogout.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiIconUser from "~/components/ui/UiIconUser.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

if (!authStore.user) {
  authStore.initAuth();
}

const handleClickLogout = () => {
  authStore.setAccessToken("");
  navigateTo("/auth/login");
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
  position: fixed;
  color: var(--ui-text-main);
  height: 100vh;
  width: 6.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
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
    height: auto;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    flex-direction: column;

    &__logo {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__profile {
      &__image {
        margin: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 62px;
        width: 62px;
        border: 3px solid var(--ui-text-main);
        border-radius: 25%;

        img {
          width: 60px;
          height: 58px;
          object-fit: cover;
          border-radius: 23%;
        }

        &.active {
          border-color: var(--ui-primary-main);
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
    height: calc(100vh - 160px);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__actions {
    height: 72px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    padding: 0 10px;
  }

  &__logout {
    height: 72px;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    border-top: 1px solid var(--color-stroke-ui);

    padding: 0 10px;
  }
}

.svg-invert {
  filter: invert(1);
}

@keyframes shadowPulse {
  0% {
    box-shadow: 0 0 1px -1px var(--color-ui-background);
  }
  100% {
    box-shadow: 0 0 5px 1px var(--color-stroke-ui-dark);
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
</style>
