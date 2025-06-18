<template>
  <div class="trading-conditions">
    <UiContainer>
      <UiTextH3 class="trading-conditions_title"> Trading Conditions </UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/trading-conditions",
});
</script>

<style lang="scss" scoped>
.trading-conditions {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
