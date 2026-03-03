<template>
  <div class="admin-login">
    <div class="admin-login__logo">
      <UiIconLogo
        :class="{
          'svg-invert': isThemeLight,
        }"
      />
    </div>

    <div class="admin-login__content">
      <PanelDefault class="panel-default">
        <AdminLoginForm :formData="formData" @input2-fa="handleInput2Fa" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted} from "vue";
import { formData } from "./composables";
import { useThemeStore } from "~/stores/themeStore.js";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import AdminLoginForm from "~/pages/admin/auth/login/components/AdminLoginForm.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
// @ts-ignore
definePageMeta({
  middleware: ["admin-login-middleware"],
  layout: "empty",
});

const themeStore = useThemeStore();

const isThemeLight = computed(() => {
  return themeStore.currentTheme !== "dark";
});

const handleInput2Fa = (value:string) => {
  formData.twoFaCode = value;
}

onMounted(() => {
  formData.twoFaCode = '';
})
</script>

<style lang="scss" scoped>
.admin-login {
  min-height: 100dvh;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: clamp(16px, 2.8vh, 30px);
  padding: clamp(16px, 2.4vh, 24px) 16px 24px;

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding-top: clamp(0px, 1vh, 8px);
    flex-shrink: 0;
  }

  &__content {
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.panel-default {
  padding: clamp(24px, 3vw, 40px);
  max-width: 600px;
  width: min(100%, 600px);
}

.admin-login__logo :deep(svg),
.admin-login__logo :deep(img) {
  width: min(220px, 60vw);
  height: auto;
  max-height: 72px;
}

.svg-invert {
  filter: invert(1);
}

@media (max-width: 639px) {
  .panel-default {
    padding: 20px 16px;
  }
}
</style>
