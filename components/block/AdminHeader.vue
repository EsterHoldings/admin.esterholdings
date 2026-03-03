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

          <div
            ref="profileContainerRef"
            class="flex justify-end items-center gap-3 relative cursor-pointer"
            @click="handleClickProfileMenu"
          >
            <UiImageCircle class="!h-[32px] !w-[32px]" :class="{ 'svg-invert': isThemeLight }" />
            <UiTextParagraph>John Snow</UiTextParagraph>
            <UiIconArrowDown :rotate180="profileMenuIsOpen" />

            <div
              ref="profileMenuRef"
              class="fixed sm:absolute top-[80px] sm:top-9 left-5 right-5 sm:left-auto sm:right-0 sm:w-fit bg-[var(--ui-background)] border border-[var(--color-stroke-ui-light)] rounded-md z-10"
              v-if="profileMenuIsOpen"
              @click.stop
            >
              <NuxtLink :to="localePath('/profile')" aria-label="Profile">
                <div
                  class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md"
                >
                  <UiIconSetting />
                  <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.accountSettings") }}</UiTextSmall>
                </div>
              </NuxtLink>

              <div
                aria-label="Toggle theme"
                @click.stop="handleToggleTheme"
                class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md cursor-pointer"
              >
                <transition name="fade" mode="out-in">
                  <UiIconSun v-if="themeStore.currentTheme === 'dark'" :key="'sun'" />
                  <UiIconMoon v-else :key="'moon'" />
                </transition>
                <UiTextSmall class="w-full whitespace-nowrap">
                  {{ themeStore.currentTheme === "dark" ? t("cabinet.header.switchToLight") : t("cabinet.header.switchToDark") }}
                </UiTextSmall>
                <div class="shrink-0" @click.stop>
                  <UiSwitchToggle :model-value="isThemeLight" @update:modelValue="handleToggleTheme" />
                </div>
              </div>

              <UiSpacer :heightNone="true" />

              <NuxtLink :to="localePath('/support')" aria-label="Help Center">
                <div
                  class="flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md"
                >
                  <UiIconSupport />
                  <UiTextSmall class="w-full whitespace-nowrap">{{ t("cabinet.header.helpCenter") }}</UiTextSmall>
                </div>
              </NuxtLink>

              <UiSpacer :heightNone="true" />

              <button
                type="button"
                class="w-full flex items-center justify-between gap-4 hover:bg-[var(--ui-primary-main)] py-2 px-5 m-1 rounded-md"
                @click="handleClickLogout"
              >
                <UiIconLogout />
                <UiTextSmall class="w-full whitespace-nowrap text-left">{{ t("cabinet.header.logout") }}</UiTextSmall>
              </button>
            </div>
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
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useThemeStore } from "~/stores/themeStore";
import { useRoute } from "vue-router";
import UiTextParagraph from "~/components/ui/UiTextParagraph.vue";
import UiIconArrowDown from "~/components/ui/UiIconArrowDown.vue";
import UiIconBell from "~/components/ui/UiIconBell.vue";
import UiIconSetting from "~/components/ui/UiIconSetting.vue";
import UiIconSupport from "~/components/ui/UiIconSupport.vue";
import UiIconLogout from "~/components/ui/UiIconLogout.vue";
import UiTextSmall from "~/components/ui/UiTextSmall.vue";
import UiSpacer from "~/components/ui/UiSpacer.vue";
import UiSwitchToggle from "~/components/ui/UiSwitchToggle.vue";
import { useI18n } from "vue-i18n";
import { useAdminAuthStore } from "~/stores/adminAuthStore";
import { useLocalePath } from "~/.nuxt/imports";

const themeStore = useThemeStore();
const emit = defineEmits(["toggle-sidebar"]);
const { t } = useI18n({ useScope: "global" });
const localePath = useLocalePath();
const adminAuthStore = useAdminAuthStore();

const route = useRoute();
const currentRouteName = computed(() => route.name);

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});

const profileMenuIsOpen = ref(false);
const profileMenuRef = ref(null);
const profileContainerRef = ref(null);

const handleClickProfileMenu = () => {
  profileMenuIsOpen.value = !profileMenuIsOpen.value;
};

const handleClickOutside = (event: MouseEvent) => {
  if (profileContainerRef.value && !profileContainerRef.value.contains(event.target as Node)) {
    profileMenuIsOpen.value = false;
  }
};

const handleToggleTheme = () => {
  themeStore.toggleTheme();
};

const handleClickLogout = () => {
  adminAuthStore.authLogout();
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
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
