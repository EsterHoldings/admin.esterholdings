<template>
  <div class="page--min-height login">
    <div class="admin-login-form-wrapper__logo">
      <UiIconLogo
        :class="{
          'svg-invert': isThemeLight,
        }"
      />
    </div>

    <div class="admin-login-form-wrapper">
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
  display: flex;
  justify-content: center;
  align-items: center;

  &-form-wrapper {
    width: 100%;
    height: calc(100vh - 150px);

    display: flex;
    align-items: center;
    justify-content: center;

    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
      padding: 10px;
    }
  }
}

.panel-default {
  padding: 40px;
  max-width: 600px;
  width: 100vw;
}

.svg-invert {
  filter: invert(1);
}
</style>
