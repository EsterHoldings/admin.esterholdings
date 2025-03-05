<template>
  <div :class="{ blurred: isBlurred }" class="header__wrapper">
    <UiContainer>
      <header class="header">
        <div class="logo">
          <UiIconLogo />
        </div>
        <nav class="nav">
          <HeaderLink
            v-for="link in linksList"
            :key="link"
            :name="link.name"
            :path="link.path"
          />
        </nav>
        <div class="actions-wrapper">
          <div class="actions">
            <UiButtonDefault state="link">Log In</UiButtonDefault>

            <UiButtonDefault state="primary">Register</UiButtonDefault>
            <UiIconGlobe class="icon" />
            <UiIconMoon class="icon" />
          </div>
        </div>
      </header>
    </UiContainer>
  </div>
</template>

<script setup>
import useTrackScroll from "./composables/trackScroll";
import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import HeaderLink from "./components/HeaderLink.vue";
import UiContainer from "~/components/ui/UiContainer.vue";

const { isBlurred } = useTrackScroll();

const linksList = [
  {
    name: "Trading",
    path: "#",
  },
  {
    name: "Partnership",
    path: "#",
  },
  {
    name: "Company",
    path: "#",
  },
];
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  background: transparent;
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  z-index: 9998;

  &__wrapper {
    position: fixed;
    z-index: 1;
    width: 100%;
  }
}

.blurred {
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-left: 10px;
}

.nav {
  display: flex;
  gap: 15px;
}

.actions {
  position: relative;
  display: flex;
  width: auto;
  align-items: center;
  gap: 10px;
  margin-right: 20px;

  .login {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 16px;
  }

  .register {
    background: blue;
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
  }

  .icon {
    cursor: pointer;
  }
}
</style>
