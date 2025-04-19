<template>
  <div>
    <div v-if="isMenuOpen" class="overlay blurred"></div>
    <div
      :class="{ blurred: isBlurred, 'nav--open': isMenuOpen }"
      class="header__wrapper"
    >
      <UiContainer>
        <header class="header" :class="{ 'header-is-open-menu ': isMenuOpen }">
          <div class="logo">
            <UiIconLogo
              :class="{
                'svg-invert': isThemeLight,
              }"
            />
          </div>

          <div
            class="burger-menu"
            :class="{
              'burger-menu--open': isMenuOpen,
              'is-theme-light': isThemeLight,
            }"
            @click="toggleMenu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav class="nav" :class="{ 'nav--open': isMenuOpen }">
            <HeaderLink
              v-for="link in linksList"
              :key="link"
              :name="link.name"
              :path="link.path"
              :activeLink="activeLink"
              @mouseenter="handleMouseEnter(link.name)"
            />
          </nav>

          <div class="actions-wrapper" :class="{ 'is-menu-open': isMenuOpen }">
            <div class="actions">
              <UiButtonDefault
                state="link"
                class="login"
                :class="{
                  'is-theme-light': isThemeLight,
                }"
              >
                {{ t("header.auth.login") }}
              </UiButtonDefault>

              <UiButtonDefault
                state="primary"
                class="register"
                v-if="!isMenuOpen"
              >
                {{ t("header.auth.register") }}
              </UiButtonDefault>

              <div class="actions-icons">
                <UiIconGlobe
                  class="icon"
                  :class="{
                    'svg-invert': isThemeLight,
                  }"
                />

                <transition name="fade" mode="out-in">
                  <span
                    :key="themeStore.currentTheme"
                    @click="themeStore.toggleTheme()"
                    class="icon"
                  >
                    <UiIconMoon
                      v-if="themeStore.currentTheme === 'dark'"
                      :class="{
                        'svg-invert': isThemeLight,
                      }"
                    />

                    <UiIconSun
                      :class="{
                        'svg-invert': isThemeLight,
                      }"
                      v-else
                    />
                  </span>
                </transition>
              </div>
            </div>
          </div>
        </header>

        <div
          v-if="isMenuOpen"
          :class="{ 'nav--open': isMenuOpen }"
          class="mobile-nav"
        >
          <nav>
            <HeaderMobileLink
              v-for="link in linksList"
              :key="link"
              :name="link.name"
              :path="link.path"
              :headerItems="headerItems"
              :activeLink="activeLink"
              @click="handleMouseEnter(link.name)"
            />

            <div class="mobile-acions">
              <UiButtonDefault
                state="primary"
                class="register"
                v-if="!isMenuOpen"
              >
                {{ t("header.auth.register") }}
              </UiButtonDefault>

              <UiButtonDefault
                state="link"
                class="login"
                :class="{ 'is-theme-light': isThemeLight }"
              >
                {{ t("header.auth.login") }}
              </UiButtonDefault>
            </div>

            <div class="mobile-banner">
              <UiTextH6>BANNER</UiTextH6>
            </div>
          </nav>
        </div>
      </UiContainer>
    </div>

    <transition name="fade" mode="out-in">
      <HeaderMenu
        v-if="uiStore.showMenu"
        :key="activeLink"
        :headerItems="headerItems"
        class="fixed-header-menu"
        @mouseleave="handleMouseLeave"
      />
    </transition>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed } from "vue";
import useTrackScroll from "./composables/trackScroll";
import { useUiStore } from "~/stores/uiStore";
import { useThemeStore } from "~/stores/themeStore.js";

import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import HeaderLink from "./components/HeaderLink.vue";
import HeaderMobileLink from "./components/HeaderMobileLink.vue";
import UiContainer from "~/components/ui/UiContainer.vue";
import HeaderMenu from "~/components/block/LandingHeader/components/HeaderMenu.vue";
import UiTextH6 from "~/components/ui/UiTextH6.vue";

const themeStore = useThemeStore();
const uiStore = useUiStore();

const { isBlurred } = useTrackScroll();
const { t, tm } = useI18n();
const isMenuOpen = ref(false);
const activeLink = ref("");

// const linksList = [
//   {
//     name: "Trading",
//     path: "#",
//   },
//   {
//     name: "Partnership",
//     path: "#",
//   },
//   {
//     name: "Company",
//     path: "#",
//   },
// ];

const linksList = [
  { name: t("header.nav.trading"), path: "#" },
  { name: t("header.nav.partnership"), path: "#" },
  { name: t("header.nav.company"), path: "#" },
];

const headerItems = ref();

// const headerItems = {
//   Trading: {
//     "Account overview": [
//       { name: "Standard", path: "#" },
//       { name: "Pro", path: "#" },
//       { name: "Islamic", path: "#" },
//       { name: "Demo", path: "#" },
//     ],

//     "Market Instruments": [
//       { name: "Forex", path: "#" },
//       { name: "Metals", path: "#" },
//       { name: "Stock CFDs", path: "#" },
//       { name: "Crypto CFDs", path: "#" },
//       { name: "Commodities", path: "#" },
//       { name: "Indices", path: "#" },
//       { name: "ETFs", path: "#" },
//     ],
//     Platform: [
//       { name: "MT4 Desktop", path: "#" },
//       { name: "MT 4 Mobile", path: "#" },
//     ],

//     "Trading conditions": [
//       { name: "Account replenishment", path: "#" },
//       { name: "Withdrawal of funds", path: "#" },
//     ],

//     "Trader's HUB": [
//       { name: "Trader's blog", path: "#" },
//       { name: "Economic calendar", path: "#" },
//       { name: "Market news", path: "#" },
//     ],
//     "TANDEM trading": [
//       { name: "For trader", path: "#" },
//       { name: "For investor", path: "#" },
//     ],
//   },

//   Partnership: {},

//   Company: {},
// };

const isThemeLight = computed(() => {
  return (
    (uiStore.headerScrolled && themeStore.currentTheme !== "dark") ||
    (themeStore.currentTheme !== "dark" && isMenuOpen.value)
  );
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  uiStore.showMenu = false;

  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
  } else {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
  }
};

function normalizeHeaderItems(raw) {
  const result = {};

  for (const section in raw) {
    result[section] = raw[section].map((item) => ({
      name:
        typeof item.name === "string"
          ? item.name
          : item.name?.body?.static ?? "",

      path: typeof item.path === "string" ? "#" : item.path?.body?.static,
    }));
  }

  return result;
}

const handleMouseEnter = (name) => {
  if (activeLink.value !== name) {
    activeLink.value = name;
    uiStore.showMenu = true;
    const raw = tm(`header.megaMenu.${activeLink.value}`);
    headerItems.value = normalizeHeaderItems(raw);
  } else {
    activeLink.value = "";
    uiStore.showMenu = false;
  }
};

const handleMouseLeave = () => {
  uiStore.showMenu = false;
  activeLink.value = "";
};
</script>

<style lang="scss" scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  background: transparent;
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  z-index: 9999;

  &__wrapper {
    position: fixed;
    width: 100%;
    z-index: 10000;

    .login {
      color: white;
    }
  }
}

.blurred {
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
}

.is-theme-light {
  color: #151515 !important;

  span {
    background: #151515 !important;
  }
}

.nav {
  display: flex;
  gap: 15px;

  &--open {
    display: flex;
  }
}

.burger-menu {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: none;
  width: 30px;
  height: 25px;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  z-index: 10001;
  order: 6;

  span {
    display: block;
    width: 100%;
    height: 3px;
    background: white;
    border-radius: 3px;
    transition: 0.3s;
  }
}

.burger-menu--open {
  span:nth-child(1) {
    transform: translateY(12px) rotate(45deg);
  }

  span:nth-child(2) {
    opacity: 0;
  }

  span:nth-child(3) {
    transform: translateY(-10px) rotate(-45deg);
  }
}

.fixed-header-menu {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mobile-nav {
  position: fixed;
  top: 80px;
  left: 0;
  width: 100%;
  height: calc(100vh - 80px);
  padding: 10px;
  z-index: 10001;
  overflow-y: auto;
  transform: translateY(-30px) scale(0.98);
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;

  nav {
    padding: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 40px;

    .mobile-acions {
      width: 100%;

      button {
        width: 100%;
      }
    }

    .mobile-banner {
      padding: 54px 154px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 15px;
      background: var(--ui-background-card);

      h6 {
        text-align: center;
        color: var(--ui-text-main);
      }
    }
  }
}

.nav--open {
  opacity: 1;
  transform: translateY(0) scale(1);
  background: var(--ui-background);
}

.actions {
  position: relative;
  display: flex;
  width: auto;
  align-items: center;
  gap: 10px;
  margin-right: 20px;

  .icon {
    cursor: pointer;
    margin-right: 16px;
  }

  &-icons {
    display: flex;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.svg-invert {
  filter: invert(1);
}

@media (max-width: 991px) {
  .nav {
    display: none;
  }

  .burger-menu {
    display: flex;
  }

  .login {
    display: none;
    padding: 0;
  }

  .actions-wrapper {
    padding-right: 50px;
  }

  .actions-icons {
    display: none;
  }

  .is-menu-open {
    padding-left: 15px;
    border-left: 1px solid var(--ui-gray);

    .actions {
      &-icons {
        display: block;
      }
    }
  }

  .header-is-open-menu {
    justify-content: unset !important;
    transition: all 0.2s ease;
  }
}

@media (max-width: 575px) {
  .logo {
    margin-right: 15px;
    padding-left: 25px;

    svg {
      width: auto;
      height: 40px;
    }
  }

  .register {
    padding: 15px;
  }
}
</style>
