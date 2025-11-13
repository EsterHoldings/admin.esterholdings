<template>
  <div class="page--min-height registration">
    <div class="registration-form__wrapper">
      <PanelDefault class="registration-form__panel-default">
        <RegistrationForm :formData="formData" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";

import RegistrationForm from "@/pages/auth/registration/components/RegistrationForm.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";

// @ts-ignore
definePageMeta({
  middleware: ["not-auth-client"],
  layout: "guest"
});
</script>

<style lang="scss" scoped>
.registration {
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
