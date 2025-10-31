<template>
  <div>
    <div
      v-if="isMobileMenuOpen"
      class="overlay blurred"></div>
    <div
      :class="{ blurred: isBlurred, 'nav--open': isMobileMenuOpen }"
      class="header__wrapper">
      <UiContainer>
        <header
          class="header"
          :class="{ 'header-is-open-menu ': isMobileMenuOpen }">
          <div class="logo">
            <NuxtLink to="/">
              <UiIconLogo
                :class="{
                  'svg-invert': isThemeLight || isWithPicture || forceSvgInvert,
                }" />
            </NuxtLink>
          </div>

          <div
            class="burger-menu"
            :class="{
              'burger-menu--open': isMobileMenuOpen,
              'is-theme-light': isThemeLight || isWithPicture || forceSvgInvert,
            }"
            @click="toggleMenu">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <nav
            class="nav"
            :class="{ 'nav--open': isMobileMenuOpen }">
            <HeaderLink
              v-for="link in linksList"
              :key="link.key"
              :name="link.name"
              :path="link.path"
              :activeLink="activeLink"
              @click.stop="handleClick(link.key)"
              :isInvertColor="isThemeLight || isWithPicture || forceSvgInvert" />
          </nav>

          <div
            class="actions-wrapper"
            :class="{ 'is-menu-open': isMobileMenuOpen }">
            <div class="actions">
              <NuxtLink to="/auth/login">
                <UiButtonDefault
                  state="link"
                  class="login"
                  :class="{
                    'is-theme-light': isThemeLight || isWithPicture || forceSvgInvert,
                  }">
                  {{ t('landing.header.auth.login') }}
                </UiButtonDefault>
              </NuxtLink>

              <nuxt-link
                to="/auth/registration"
                class="register">
                <UiButtonDefault
                  state="primary"
                  v-if="!isMobileMenuOpen">
                  {{ t('landing.header.auth.register') }}
                </UiButtonDefault>
              </nuxt-link>

              <div class="actions-icons">
                <LanguageSwitcher
                  class="icon"
                  :isInvert="isThemeLight || isWithPicture || forceSvgInvert" />

                <transition
                  name="fade"
                  mode="out-in">
                  <span
                    :key="themeStore.currentTheme"
                    @click="themeStore.toggleTheme()"
                    class="icon">
                    <UiIconMoon
                      v-if="themeStore.currentTheme === 'dark'"
                      :class="{
                        'svg-invert': isThemeLight || isWithPicture || forceSvgInvert,
                      }" />

                    <UiIconSun
                      :class="{
                        'svg-invert': !(isThemeLight || isWithPicture || forceSvgInvert),
                      }"
                      v-else />
                  </span>
                </transition>
              </div>
            </div>
          </div>
        </header>

        <transition name="fade">
          <div
            v-if="isMobileMenuOpen"
            :class="{ 'nav--open': isMobileMenuOpen }"
            class="mobile-nav">
            <nav>
              <HeaderMobileLink
                v-for="link in linksList"
                :key="`${link.key}-${activeLink}`"
                :name="link.name"
                :linkKey="link.key"
                :path="link.path"
                :headerItems="headerItems"
                :activeLink="activeLink"
                @click="handleClick(link.key)" />

              <div class="mobile-acions">
                <nuxt-link
                  to="/auth/registration"
                  class="register">
                  <UiButtonDefault
                    state="primary"
                    v-if="isMobileMenuOpen">
                    {{ t('landing.header.auth.register') }}
                  </UiButtonDefault>
                </nuxt-link>

                <UiButtonDefault
                  state="link"
                  :class="{ 'is-theme-light': isThemeLight }">
                  {{ t('landing.header.auth.login') }}
                </UiButtonDefault>
              </div>

              <div class="mobile-banner">
                <UiTextH6>BANNER</UiTextH6>
              </div>
            </nav>
          </div>
        </transition>
      </UiContainer>
    </div>

    <transition
      name="fade"
      mode="out-in">
      <div
        class="fixed-header-menu"
        v-if="!isMobileMenuOpen && activeLink">
        <div
          ref="menuRef"
          class="menu-content"
          :class="{
            'menu-content_is-partnership': activeLink === 'Partnership',
            'menu-content_is-company': activeLink === 'Company',
          }">
          <transition
            name="fade"
            mode="out-in">
            <TradingMenu
              v-if="activeLink === 'Trading'"
              :activeLink="activeLink" />
            <PartnershipMenu
              v-else-if="activeLink === 'Partnership'"
              :activeLink="activeLink" />
            <CompanyMenu
              v-else-if="activeLink === 'Company'"
              :activeLink="activeLink" />
          </transition>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n';
  import { ref, computed, onMounted, onBeforeUnmount, watch, provide } from 'vue';
  import { useRoute } from 'vue-router';
  import { useUiStore } from '~/stores/uiStore';
  import { useThemeStore } from '~/stores/themeStore.js';
  import useTrackScroll from './composables/trackScroll';
  import { isSlideWithoutPicture } from './composables/trackScroll';

  import UiIconLogo from '~/components/ui/UiIconLogo.vue';
  import UiIconMoon from '~/components/ui/UiIconMoon.vue';
  import UiIconSun from '~/components/ui/UiIconSun.vue';
  import UiButtonDefault from '~/components/ui/UiButtonDefault.vue';
  import HeaderLink from './components/HeaderLink.vue';
  import HeaderMobileLink from './components/HeaderMobileLink.vue';
  import UiContainer from '~/components/ui/UiContainer.vue';
  import UiTextH6 from '~/components/ui/UiTextH6.vue';
  import TradingMenu from './components/TradingMenu.vue';
  import PartnershipMenu from './components/PartnershipMenu.vue';
  import CompanyMenu from './components/CompanyMenu.vue';
  import LanguageSwitcher from './components/LanguageSwitcher.vue';

  const themeStore = useThemeStore();
  const uiStore = useUiStore();
  const route = useRoute();

  const { isBlurred } = useTrackScroll();
  const { t } = useI18n();

  const activeLink = ref('');
  provide('stateLink', activeLink);
  const headerItems = ref();
  const isMobileMenuOpen = ref(false);
  const menuRef = ref(null);
  const windowWidth = ref(0);

  const linksList = computed(() => {
    return [
      { key: 'Trading', name: t('landing.header.nav.trading') },
      { key: 'Partnership', name: t('landing.header.nav.partnership') },
      { key: 'Company', name: t('landing.header.nav.company') },
    ];
  });

  const isThemeLight = computed(() => {
    return (
      (uiStore.headerScrolled && themeStore.currentTheme !== 'dark') ||
      (themeStore.currentTheme !== 'dark' && isMobileMenuOpen.value)
    );
  });

  const isWithPicture = computed(() => {
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log('IS WITH PICTURE', themeStore.currentTheme);
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    if (themeStore.currentTheme === 'dark') {
      return false;
    } else {
      return isSlideWithoutPicture.value;
    }
  });

  const forceSvgInvert = computed(() => {
    const baseRouteName = route.name?.toString().split('___')[0];
    return themeStore.currentTheme === 'light' && baseRouteName !== 'index';
  });

  const updateWindowWidth = () => {
    if (process.client) {
      windowWidth.value = window.innerWidth;
    }
  };

  const handleClick = (name) => {
    if (activeLink.value !== name) {
      activeLink.value = name;
      uiStore.showMenu = true;
    } else {
      activeLink.value = '';
      uiStore.showMenu = false;
    }
  };
  const handleClickOutside = (event) => {
    const menuEl = menuRef.value;

    if (!menuEl || !activeLink.value) return;

    if (!menuEl.contains(event.target)) {
      activeLink.value = '';
      uiStore.showMenu = false;
    }
  };

  const toggleMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
    uiStore.showMenu = false;
    activeLink.value = '';

    if (isMobileMenuOpen.value) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  };

  onMounted(() => {
    updateWindowWidth();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateWindowWidth);
    }
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateWindowWidth);
    }
    document.removeEventListener('click', handleClickOutside);
  });

  watch(windowWidth, (width) => {
    if (width > 991 && isMobileMenuOpen.value) {
      isMobileMenuOpen.value = false;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
  });
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

  .register {
    a {
      color: inherit;
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
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9998;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    width: 100%;
    height: 100vh;
  }

  .menu-content {
    max-width: 1200px;
    margin: 0 auto;

    &_is-partnership {
      max-width: 500px;
    }

    &_is-company {
      max-width: 120px;
    }
  }

  .mobile-nav {
    position: fixed;
    top: 80px;
    left: 0;
    width: 100%;
    height: calc(100vh - 80px);
    padding: 10px;
    z-index: 10;
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
          display: flex;
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
