<template>
  <div class="page--min-height login">
    <div class="admin-login-form-wrapper__logo">
      <UiIconLogo />
    </div>
    <div class="admin-login-form-wrapper">
      <AdminLoginForm :formData="formData" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";
import UiIconLogo from "~/components/ui/UiIconLogo.vue";
import AdminLoginForm from "~/pages/admin/auth/login/components/AdminLoginForm.vue";

// @ts-ignore
definePageMeta({
  middleware: ["admin-login-middleware"],
  layout: "empty"
});
</script>

<style lang="scss" scoped>
.admin-login {
  display: flex;
  justify-content: center;
  align-items: center;

  &-form-wrapper {
    width: 100%;
    height: calc(100vh - 100px);
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
</style>
