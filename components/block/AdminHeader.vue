<template>
  <header class="header">
    <nav>
      <div class="header__menu">
        <div class="header__menu-left">
          <button class="header__burger" type="button" aria-label="Open menu" @click="emit('toggle-sidebar')">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div class="header__menu-right">
          <div class="mr-5 flex justify-end items-center gap-2">

            <LanguageSwitcher isSidebar :isInvert="isThemeLight" class="icon"/>

            <UiIconBell />

<!--            <transition name="fade" mode="out-in">-->
<!--              <span-->
<!--                  :key="themeStore.currentTheme"-->
<!--                  @click="themeStore.toggleTheme()"-->
<!--                  class="icon"-->
<!--              >-->
<!--                <UiIconMoon v-if="themeStore.currentTheme === 'dark'"/>-->
<!--                <UiIconSun-->
<!--                    v-else-->
<!--                    :class="{-->
<!--                    'svg-invert': isThemeLight,-->
<!--                  }"-->
<!--                />-->
<!--              </span>-->
<!--            </transition>-->
          </div>

          <div class="flex justify-end items-center gap-3">
            <NuxtLink to="/admin/profile">
              <UiImageCircle class="!h-[32px] !w-[32px]" :class="{ 'svg-invert': isThemeLight }" />
            </NuxtLink>
            <UiTextParagraph>John Snow</UiTextParagraph>
            <UiIconArrowDown :rotate180="false" />
          </div>

        </div>
      </div>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiImageCircle from "~/components/ui/UiImageCircle.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import LanguageSwitcher from "~/components/block/LandingHeader/components/LanguageSwitcher.vue";
import {computed} from "vue";
import {useThemeStore} from "~/stores/themeStore";
import {useRoute} from "vue-router";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
import UiIconBell from "~/components/ui/UiIconBell.vue";

const themeStore = useThemeStore();
const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();
const currentRouteName = computed(() => route.name);

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});
</script>

<style scoped lang="scss">
.router-link-exact-active {
  opacity: 0.5;
}

.header {
  width: 100%;

  nav {
    height: 60px;
    display: flex;
    padding: 0 24px;
    align-items: center;
    border-bottom: 1px solid var(--color-stroke-ui-light);
    justify-content: space-between;
  }

  &__menu {
    width: 100%;
    display: flex;
    justify-content: space-between;

    &-left {
      display: flex;
      align-items: center;

      &_item {
        margin-left: 20px;

        &:first-child {
          margin-right: 0;
        }
      }
    }

    &-right {
      display: flex;
      align-items: center;

      &_item {
        display: flex;
        align-items: center;

        margin-right: 20px;

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .header__burger {
    display: none;
    height: 36px;
    width: 36px;
    border-radius: 10px;
    border: 1px solid var(--color-stroke-ui-light);
    background: transparent;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;

    span {
      display: block;
      width: 18px;
      height: 2px;
      background: var(--ui-text-main);
      border-radius: 2px;
    }
  }

  @media (max-width: 1023px) {
    .header__menu-right {
      gap: 12px;
    }

    .header__burger {
      display: inline-flex;
    }
  }
}
</style>
