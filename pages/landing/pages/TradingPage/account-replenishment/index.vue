<template>
  <div class="account-replenishment">
    <UiContainer>
      <UiTextH3 class="account-replenishment_title">Account replenishment</UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import {definePageMeta} from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/account-replenishment",
});
</script>

<style lang="scss" scoped>
.account-replenishment {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
