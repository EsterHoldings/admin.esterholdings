<template>
  <header :class="{ blurred: isBlurred }" class="header">
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
    <div class="actions">
      <UiButtonDefault state="link">Log In</UiButtonDefault>
      <UiButtonDefault state="primary">Register</UiButtonDefault>
      <UiIconGlobe class="icon" />
      <UiIconMoon class="icon" />
    </div>
  </header>
</template>

<script setup>
import useTrackScroll from "./composables/trackScroll";
import UiIconGlobe from "~/components/ui/UiIconGlobe.vue";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import UiIconMoon from "~/components/ui/UiIconMoon.vue";
import UiIconSun from "~/components/ui/UiIconSun.vue";
import UiButtonDefault from "~/components/ui/UiButtonDefault.vue";
import HeaderLink from "./components/HeaderLink.vue";

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
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 120px;
  background: transparent;
  transition: backdrop-filter 0.3s ease, background-color 0.3s ease;
  z-index: 9999;
}

.blurred {
  background: rgba(0, 0, 40, 0.05);
  backdrop-filter: blur(10px);
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: white;
}

.nav {
  display: flex;
  gap: 15px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 10px;

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
