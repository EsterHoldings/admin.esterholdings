<template>
  <div class="trading-hub">
    <UiContainer>
      <UiTextH3 class="trading-hub_title"> Tradings HUB </UiTextH3>
    </UiContainer>
  </div>
</template>

<script setup lang="ts">
import { definePageMeta } from "~/.nuxt/imports";
import UiContainer from "~/components/ui/UiContainer.vue";
import UiTextH3 from "~/components/ui/UiTextH3.vue";

definePageMeta({
  layout: "main",
  alias: "/trader's-hub",
});
</script>

<style lang="scss" scoped>
.trading-hub {
  padding: 40px;

  &_title {
    color: var(--ui-text-main);
    text-align: center;
    margin-top: 50px;
  }
}
</style>
