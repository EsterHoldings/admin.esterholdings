<template>
  <header class="header">
    <NuxtLink to="/"
      ><UiIconLogo
        :class="{
          'svg-invert': isThemeLight,
        }"
    /></NuxtLink>
  </header>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useThemeStore } from "~/stores/themeStore.js";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";

const themeStore = useThemeStore();

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});
</script>

<style scoped lang="scss">
.router-link-exact-active {
  color: red;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.svg-invert {
  filter: invert(1);
}
</style>
