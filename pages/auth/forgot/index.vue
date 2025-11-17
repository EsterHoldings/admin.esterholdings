<template>
  <div class="page--min-height forgot">
    <div class="forgot-form__wrapper">
      <PanelDefault class="forgot-form__panel-default">
        <ForgotForm :formData="formData" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { formData } from "./composables";
  import { IFormDataDto } from "~/pages/auth/forgot/composables";
  import ForgotForm from "@/pages/auth/forgot/components/ForgotForm.vue";
  import PanelDefault from "~/components/block/panels/PanelDefault.vue";

  // @ts-ignore
  definePageMeta({
    middleware: ["not-auth-client"],
    layout: "guest",
  });

  // @ts-ignore
  onMounted(() => Object.keys(formData).forEach(key => (formData[key as keyof IFormDataDto] = "")));
</script>

<style lang="scss" scoped>
  .forgot {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;

    &-form {
      &__logo {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
      }

      &__wrapper {
        padding: 10px;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
      }

      &__panel-default {
        padding: 40px;
        max-width: 600px;
        width: 100%;
      }
    }
  }
</style>
