<template>
  <div class="for-trader">
    <UiContainer>
      <UiTextH3 class="for-trader_title">For trader </UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/for-trader",
});
</script>

<style lang="scss" scoped>
.for-trader {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
