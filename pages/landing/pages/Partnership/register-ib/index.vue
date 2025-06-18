<template>
  <div class="register-ib">
    <UiContainer>
      <UiTextH3 class="register-ib_title">Register IB/ Partnership </UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/register-ib",
});
</script>

<style lang="scss" scoped>
.register-ib {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
