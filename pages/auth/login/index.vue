<template>
  <div class="page--min-height login">
    <div class="login-form__wrapper">
      <PanelDefault class="login-form__panel-default">
        <LoginForm :formData="formData" @input2-fa="handle2faInput" />
      </PanelDefault>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { formData } from "./composables";
import LoginForm from "@/pages/auth/login/components/LoginForm.vue";
import PanelDefault from "~/components/block/panels/PanelDefault.vue";
import {onMounted} from "vue";

// @ts-ignore
definePageMeta({
  middleware: ["not-auth-client"],
  layout: "guest"
});

const handle2faInput = (value: string) => {
  formData.twoFaCode = value;
}

onMounted(() => {
  formData.twoFaCode = '';
})
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100dvw; // TODO :: It is Dynamic View Width

  &-form {
    &__logo {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100dvh;
    }

    &__wrapper {
      padding: 10px;
      height: calc(100dvh - 20px); // TODO :: ??? Check it
      display: flex;
      align-items: center;
      justify-content: center;
      width: calc(100dvw - 20px);
    }

    &__panel-default {
      padding: 40px;
      max-width: 600px;
      width: 100dvw;
    }
  }
}
</style>
