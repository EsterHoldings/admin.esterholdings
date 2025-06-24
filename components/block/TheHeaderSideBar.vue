<template>
  <header class="header" :class="{ 'is-open': isOpen }">
    <div class="header__top">
      <div class="header__top-left" :class="{ 'is-not-open': !isOpen }">
        <UiIconLogo />
      </div>

      <div class="header__top-right">
        <UiIconArrowsLeft
          :rotateToRight="!isOpen"
          @click="handleClickOpenCloseSideBar"
        />
      </div>
    </div>

    <TheHeaderSideBarMenu :sideBarIsOpen="isOpen" />

    <div class="header__bottom">
      <div class="header__bottom-left" :class="{ 'is-not-open': !isOpen }">
        <UiImageCircle />
      </div>

      <div class="header__bottom-right" :class="{ 'is-not-open': !isOpen }">
        <div
          class="header__bottom-right__wrapper"
          @click="handleClickLogoutButton"
        >
          <span>Logout</span>
          <UiIconLogout />
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts" setup>
import useAppCore from "~/composables/useAppCore";
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { navigateTo } from "nuxt/app";
import { useAuthStore } from "~/stores/authStore";

import { ROUTE_AUTH_LOGIN } from "~/constants/routes";

import TheHeaderSideBarMenu from "~/components/block/TheHeaderSideBarMenu.vue";
import UiIconArrowsLeft from "~/components/ui/UiIconArrowsLeft.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconLogout from "~/components/ui/UiIconLogout.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";

const appCore = useAppCore();
const authStore = useAuthStore();

const isOpen = ref(false);

onMounted(() => {
  const storedState = localStorage.getItem("sidebarIsOpen");
  if (storedState !== null) {
    isOpen.value = storedState === "true";
  }
});

const handleClickOpenCloseSideBar = () => {
  isOpen.value = !isOpen.value;
  localStorage.setItem("sidebarIsOpen", isOpen.value.toString());
};

const handleClickLogoutButton = async () => {
  await appCore.auth.doLogout();
  authStore.setAccessToken("");
  navigateTo(ROUTE_AUTH_LOGIN);
};
</script>

<style scoped lang="scss">
.router-link-exact-active {
  opacity: 0.5;
}

.header {
  background-color: var(--ui-background);
  height: 100vh;
  border-right: 1px solid var(--color-stroke-ui-dark);
  min-width: 60px;
  transition: 0.3s;

  &.is-open {
    transition: 0.3s;
    min-width: 360px;
  }

  &__top {
    color: #d8d8d8;

    height: 70px;
    width: 100%;
    background-color: var(--color-stroke-ui-dark);

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;

    &-left {
      svg {
        transition: 0.3s;
      }

      &.is-not-open {
        svg {
          width: 0;
          transition: 0.1s;
        }
      }
    }

    &-right {
      svg {
        height: 14px;
        width: 14px;
      }
    }
  }

  &__bottom {
    color: #a4a4a4;

    height: 70px;
    width: 100%;
    background-color: var(--color-stroke-ui-dark);

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 0 20px;

    &-left {
      div {
        transition: 0.3s;
      }

      &.is-not-open {
        div {
          width: 0;
          transition: 0.1s;
          overflow: hidden;
        }
      }
    }

    &-right {
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__wrapper {
        padding: 0 20px;
        width: auto;
        height: 60px;
        display: flex;
        align-items: center;
        border-radius: 25px;

        &:hover {
          background-color: var(--color-ui-background);
        }

        &:active {
          background-color: var(--color-stroke-ui-dark);
        }
      }

      &.is-not-open {
        span {
          display: block;
          width: 0;
          transition: 0.1s;
          overflow: hidden;
          margin-left: -16px;
        }
      }

      span {
        margin-right: 10px;
        font-size: 13px;
      }
    }
  }
}
</style>
